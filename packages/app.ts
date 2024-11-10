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
        const websiteBucket = new s3.Bucket(this, "StaticAssets", {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev - change for prod
            autoDeleteObjects: true, // For dev - change for prod
        });

        // CloudFront distribution
        const distribution = new cloudfront.Distribution(this, "Distribution", {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket),
                viewerProtocolPolicy:
                    cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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

        // DynamoDB table
        const table = new dynamodb.Table(this, "Table", {
            partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev - change for prod
        });

        // Secrets
        const secret = new secretsmanager.Secret(this, "AppSecrets", {
            secretName: "my-app-secrets",
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    DATABASE_URL: "your-db-url",
                    API_KEY: "your-api-key",
                }),
                generateStringKey: "password",
            },
        });

        // ECS Cluster
        const cluster = new ecs.Cluster(this, "Cluster", {
            vpc,
            containerInsights: true,
        });

        // Single instance AutoScaling Group
        const autoScalingGroup = new autoscaling.AutoScalingGroup(this, "ASG", {
            vpc,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.SMALL
            ),
            machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
            minCapacity: 1,
            maxCapacity: 1,
            desiredCapacity: 1,
            healthCheck: autoscaling.HealthCheck.elb({
                grace: cdk.Duration.seconds(60),
            }),
            // Configure update policy for less disruptive deployments
            updatePolicy: autoscaling.UpdatePolicy.replacingUpdate({
                maxBatchSize: 1,
            }),
        });

        const capacityProvider = new ecs.AsgCapacityProvider(
            this,
            "AsgCapacityProvider",
            {
                autoScalingGroup,
                enableManagedScaling: false, // Disable managed scaling since we want exactly one instance
                enableManagedTerminationProtection: false, // Allow instance replacement during updates
            }
        );
        cluster.addAsgCapacityProvider(capacityProvider);

        // ALB with increased timeout for SSE
        const alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
            vpc,
            internetFacing: true,
        });

        const listener = alb.addListener("Listener", {
            port: 80,
        });

        // Increase the idle timeout for SSE
        const cfnALB = alb.node.defaultChild as elbv2.CfnLoadBalancer;
        cfnALB.addPropertyOverride("LoadBalancerAttributes", [
            {
                Key: "idle_timeout.timeout_seconds",
                Value: "900", // 15 minutes
            },
        ]);

        // ECR Repository
        const repository = new ecr.Repository(this, "Repository", {
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev - change for prod
        });

        // ECS Task Definition
        const taskDefinition = new ecs.Ec2TaskDefinition(this, "TaskDef");

        // Grant permissions
        secret.grantRead(taskDefinition.taskRole);
        table.grantReadWriteData(taskDefinition.taskRole);

        // Add container to task definition
        const container = taskDefinition.addContainer("AppContainer", {
            image: ecs.ContainerImage.fromEcrRepository(repository),
            memoryLimitMiB: 512,
            cpu: 256,
            logging: ecs.LogDrivers.awsLogs({ streamPrefix: "my-app" }),
            environment: {
                NODE_ENV: "production",
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
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [service],
            healthCheck: {
                path: "/health",
                interval: cdk.Duration.seconds(30),
                timeout: cdk.Duration.seconds(5),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 3,
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

        // Outputs
        new cdk.CfnOutput(this, "CloudFrontURL", {
            value: distribution.distributionDomainName,
        });

        new cdk.CfnOutput(this, "LoadBalancerURL", {
            value: alb.loadBalancerDnsName,
        });
    }
}
