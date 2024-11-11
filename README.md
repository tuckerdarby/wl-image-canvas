# wl-image-canvas

An example application that utilizes Fal and OpenAI to create a variation of images.

## Requirements

```
NodeJS (20.9.x)
npm (10.1.0)
```

## Packages

This is a monorepo containing frontend (client), backend (api), and infrastructure (infra) for deploying to AWS.

### Client

The client is a React Typescript frontend that uses shadcn for UI components. The client maintains an SSE connection with the API server to receive updates.

### API

The api is an ExpressJS in Typescript application. All API calls are over HTTP but it utilizes Server-side events (SSE) to notify the frontend of changes.

### Infra

The infra is Typescript CDK for Infrastructure-as-Code (IaC).

## Installation

You can install and build all from the root package with

```
npm install
npm run build
```

## Running Locally

To run locally ensure that you use create a `.env` from the `.env.template` in `packages/api/`. It requires your keys.

Then you can run all from the repo root with

```
npm run dev
```

The server runs on port 3000 and the frontend can be reached on localhost:5732

## Docker Build

You can build the docker image and deploy with the following commands

```
# BUILD
docker build --platform linux/amd64 -t wl-canvas-app -f packages/api/Dockerfile .

# DEPLOY TO AWS
export ACCOUNT_ID=<YOUR_AWS_ACCOUNT_ID>

aws ecr create-repository --repository-name wl-canvas-app
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com
docker tag my-app-api:latest wl-canvas-app:latest
docker tag wl-canvas-app:latest $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/wl-canvas-app:latest

docker push $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/wl-canvas-app:latest
```

You can run the docker container in development mode:

```
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e FAL_API_KEY=$FAL_API_KEY \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  wl-canvas-app
```

You can also run the docker container in production mode:

```
docker run -p 3000:3000 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN \
  -e NODE_ENV=production \
  -e AWS_REGION="us-west-2" \
  wl-canvas-app
```

## Deploying to AWS

After you deploy the docker image you can deploy the infrastructure to AWS.

First create the secrets in Secrets Manager with the name `prod/app/secrets` containing the Fal and OpenAI keys and values.

The API server is hosted via ECS. Currently it is limited to only running one instance since sticky sessions nor event routing (e.g. via Redis) are not set up.
There's no CloudWatch metrics or alarms due to time constraints (and this isn't a real app).

In the `packages/infra` directory:

```
# after logging into the aws cli
cdk bootstrap
cdk deploy
```

This should give you a cloudfront URL.

Then deploy the frontend to S3 (this could be automated but for the sake of time omitted).

```
cd packages/client
npm run build
aws s3 sync ./dist s3://<S3-Bucket-that-was-deployed>
```

## Authorization

Beware, there's no authorization, so the app is open to the public to be used.
