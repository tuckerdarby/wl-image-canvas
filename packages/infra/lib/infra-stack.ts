import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // VPC
        const vpc = new ec2.Vpc(this, "AppVPC", {
            maxAzs: 2,
            natGateways: 1,
        });

        // Frontend: S3 bucket for static website
        const websiteBucket = new s3.Bucket(this, "StaticAssetsBucket", {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const table = new dynamodb.Table(this, "Table", {
            partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev - change for prod
        });

        // Secrets -- needs to be manually created for this app
        const secret = secretsmanager.Secret.fromSecretNameV2(
            this,
            "AppSecrets",
            "prod/app/secrets"
        );

        const cluster = new ecs.Cluster(this, "Cluster", {
            vpc,
            containerInsights: true,
        });

        const instanceRole = new iam.Role(this, "EC2InstanceRole", {
            assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    "service-role/AmazonEC2ContainerServiceforEC2Role"
                ),
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    "AmazonEC2ContainerRegistryReadOnly"
                ),
            ],
        });

        const ec2SecurityGroup = new ec2.SecurityGroup(
            this,
            "EC2SecurityGroup",
            {
                vpc,
                description: "Security group for EC2 instances in ECS cluster",
                allowAllOutbound: true,
            }
        );

        const autoScalingGroup = new autoscaling.AutoScalingGroup(this, "ASG", {
            vpc,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.SMALL
            ),
            machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
            minCapacity: 1, // Since we don't have sticky sessions or inter-service communication to facilitate SSE
            maxCapacity: 1,
            desiredCapacity: 1,
            healthCheck: autoscaling.HealthCheck.elb({
                grace: cdk.Duration.seconds(60),
            }),
            securityGroup: ec2SecurityGroup,
            role: instanceRole,
        });

        const capacityProvider = new ecs.AsgCapacityProvider(
            this,
            "AsgCapacityProvider",
            {
                autoScalingGroup,
                enableManagedScaling: false,
                enableManagedTerminationProtection: false,
            }
        );
        cluster.addAsgCapacityProvider(capacityProvider);

        const albSecurityGroup = new ec2.SecurityGroup(
            this,
            "ALBSecurityGroup",
            {
                vpc,
                description: "Security group for ALB",
                allowAllOutbound: true,
            }
        );

        albSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            "Allow inbound HTTP traffic from anywhere"
        );

        albSecurityGroup.addEgressRule(
            ec2.Peer.securityGroupId(ec2SecurityGroup.securityGroupId),
            ec2.Port.tcp(3000),
            "Allow outbound traffic to ECS tasks on port 3000"
        );

        ec2SecurityGroup.addIngressRule(
            ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
            ec2.Port.tcp(3000),
            "Allow inbound from ALB"
        );

        const alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
            vpc,
            internetFacing: true,
            securityGroup: albSecurityGroup,
        });
        const albOrigin = new origins.LoadBalancerV2Origin(alb, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        });

        const distribution = new cloudfront.Distribution(this, "Distribution", {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket),
                viewerProtocolPolicy:
                    cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            additionalBehaviors: {
                "/api/*": {
                    origin: albOrigin,
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    originRequestPolicy:
                        cloudfront.OriginRequestPolicy.ALL_VIEWER,
                },
            },
            defaultRootObject: "index.html",
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html",
                },
            ],
        });

        const listener = alb.addListener("Listener", {
            port: 80,
        });

        const cfnALB = alb.node.defaultChild as elbv2.CfnLoadBalancer;
        cfnALB.addPropertyOverride("LoadBalancerAttributes", [
            {
                Key: "idle_timeout.timeout_seconds",
                Value: "900", // 15 minutes
            },
        ]);

        // ECR Repository -- needs to be manually made from pushing docker container
        const repository = ecr.Repository.fromRepositoryName(
            this,
            "Repository",
            "wl-canvas-app"
        );

        // ECS Task Definition
        const taskDefinition = new ecs.Ec2TaskDefinition(this, "TaskDef", {
            networkMode: ecs.NetworkMode.HOST,
        });

        secret.grantRead(taskDefinition.taskRole);
        table.grantReadWriteData(taskDefinition.taskRole);

        const container = taskDefinition.addContainer("AppContainer", {
            image: ecs.ContainerImage.fromEcrRepository(repository, "latest"),
            memoryLimitMiB: 1024,
            cpu: 512,
            logging: ecs.LogDrivers.awsLogs({ streamPrefix: "wl-canvas-app" }),
            environment: {
                NODE_ENV: "production",
                DYNAMODB_TABLE_NAME: table.tableName,
                AWS_REGION: cdk.Stack.of(this).region,
                AWS_SECRET_NAME: "prod/app/secrets",
            },
            secrets: {
                APP_SECRETS: ecs.Secret.fromSecretsManager(secret),
            },
        });

        container.addPortMappings({
            containerPort: 3000,
            protocol: ecs.Protocol.TCP,
        });

        // ECS Service with single task
        const service = new ecs.Ec2Service(this, "Service", {
            cluster,
            taskDefinition,
            desiredCount: 1,
            maxHealthyPercent: 100,
            minHealthyPercent: 0,
            healthCheckGracePeriod: cdk.Duration.seconds(120),
            capacityProviderStrategies: [
                {
                    capacityProvider: capacityProvider.capacityProviderName,
                    weight: 1,
                },
            ],
            circuitBreaker: { rollback: true }, // Enable rollback if deployment fails
        });

        // Add target group with increased deregistration delay
        listener.addTargets("Target", {
            port: 3000,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [service],
            healthCheck: {
                path: "/health",
                interval: cdk.Duration.seconds(60),
                timeout: cdk.Duration.seconds(30),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 5,
                healthyHttpCodes: "200-299",
            },
            deregistrationDelay: cdk.Duration.seconds(120),
        });

        // Allow the ALB security group to access the ECS security group
        service.connections.allowFrom(
            alb,
            ec2.Port.tcp(3000),
            "Allow inbound from ALB"
        );
        service.connections.allowTo(
            alb,
            ec2.Port.tcp(3000),
            "Allow outbound to ALB"
        );

        service.connections.allowFrom(
            alb,
            ec2.Port.tcp(80),
            "Allow inbound from ALB"
        );
        service.connections.allowTo(
            alb,
            ec2.Port.tcp(3000),
            "Allow outbound to ALB"
        );

        // Outputs
        new cdk.CfnOutput(this, "CloudFrontURL", {
            value: distribution.distributionDomainName,
        });

        new cdk.CfnOutput(this, "LoadBalancerURL", {
            value: alb.loadBalancerDnsName,
        });
    }
}
