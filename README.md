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
