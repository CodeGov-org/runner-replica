# Runner Replica

Runner for checking Internet Computer replica proposals

## Getting Started

Clone, then do "npm install".

Then you can run the script as:
"PROPOSAL=124272 npx runner"

NOTE:
It requires a cloud server that had already installed:

- podman

It requires that you have access to it through ssh console.
Please update IP and file path on the CONST section of the script.

## Updating Docker Image

AWS Fargate runs a task, that is a Docker image.

That image is stored in AWS ECR public repository:
https://gallery.ecr.aws/i2c0e4t6

If you don't have access, feel free to request access to Tiago or to create a public repo on your own (and update the commands to your url).

### Steps

1. Ensure you have aws cli and Docker desktop installed. Sign in with any account on your Docker Desktop.

2. Command to generate authentication token:

   - aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/i2c0e4t6

3. Commands to update it (after authentication):

   - docker build -t runner-replica .
   - docker tag runner-replica:latest public.ecr.aws/i2c0e4t6/runner-replica:latest
   - docker push public.ecr.aws/i2c0e4t6/runner-replica:latest

## Roadmap

v0:

- [x] setup Hetzner
- [x] copy manual script
- [x] improve format

v1:

- [ ] run long task (AWS Fargate)
- [ ] add DSCVR notifier of result
- [ ] add email notifier

v1.1:

- [ ] add automatic trigger (AWS Lambda)

v2:

- make it easy for anyone to fork and config with their credentials

## Learning

Learn more about Node JS scripting in:
https://exploringjs.com/nodejs-shell-scripting/ch_creating-shell-scripts.html
