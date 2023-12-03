import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// CONST VARs
export const SERVER_IP = "37.27.9.86";
export const NOTIFY_EMAILS = ["codegov@googlegroups.com"];
export const SANDBOX_MODE = false;

// get dynamic data
export const getHetznerSSH = async () => {
  return getSecret("code-gov/runner-replica/hetzner-ssh-key");
};

export const getRunnerSecrets = async () => {
  const secretsString = await getSecret(
    "code-gov/runner-replica/runner-secrets",
  );
  return JSON.parse(secretsString);
};

const getSecret = async (secretName) => {
  // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
  const client = new SecretsManagerClient({ region: "eu-west-1" });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName }),
    );
  } catch (error) {
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    console.log(JSON.stringify(error));
    process.exit(1);
  }

  const secret = response.SecretString;
  return secret;
};

export const getSharedData = async () => {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/classes/getparametercommand.html
  const parameterName = "codegov-runner_replica-shared_data";
  const client = new SSMClient({ region: "eu-west-1" });
  const command = new GetParameterCommand({ Name: parameterName });

  let response;
  try {
    response = await client.send(command);
  } catch (error) {
    console.log(JSON.stringify(error));
    process.exit(1);
  }

  const sharedData = response?.Parameter?.Value;
  return JSON.parse(sharedData);
};
