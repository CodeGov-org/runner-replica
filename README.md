# Runner Replica

Runner for checking Internet Computer replica proposals

## Getting Started

Clone, then do "npm install" in both fargate_task and lambda.

If you want to run the fargate_task, inside it:
- `npx runner`

If you want to run the lambda:
- in index.mjs make sure you call `handler();`
- then run it: `npx index.mjs`

## Requirements

It requires you to create an AWS Secrets, an AWS Parameter Store and a cloud server (like Hetzner).

Pretty much, the lambda is checking the open proposals, and if open, stores the new ids on the Parameter Store.
Then on the fargate task:
- it uses the ssh key access in AWS Secrets to call the Hetzner server and run it.
- and the mail credentials on AWS Secrets to send email results.

## Cloud Server Instructions

Cloud server should have the capacity and OS requested by the replica script.

It should already have installed:
- podman

It requires that you have access to it through ssh console.
Then please update AWS SECRETS and the config.js file of the fargate_task.

## Updating Docker Image

AWS Fargate runs a task, that is a Docker image.

That image is stored in AWS ECR public repository:
https://gallery.ecr.aws/i2c0e4t6

If you don't have access, feel free to request access to Tiago or to create a public repo on your own (and update the commands below to your url).

### Steps

1. Ensure you have aws cli and Docker desktop installed. Sign in with any account on your Docker Desktop.

2. Command to generate authentication token:

   - aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/i2c0e4t6

3. Commands to update it (after authentication):

   - docker build -t runner-replica . (or, if on M1/M2: docker buildx build --platform=linux/amd64 -t runner-replica .)
   - docker tag runner-replica:latest public.ecr.aws/i2c0e4t6/runner-replica:latest
   - docker push public.ecr.aws/i2c0e4t6/runner-replica:latest

## Roadmap

v0:

- [x] setup Hetzner
- [x] copy manual script
- [x] improve format

v1:

- [x] run long task (AWS Fargate)
- [ ] add DSCVR notifier of result
- [x] add email notifier

v1.1:

- [x] add automatic trigger (AWS Lambda)

v2:

- [x] make it easy for anyone to fork and config with their credentials
