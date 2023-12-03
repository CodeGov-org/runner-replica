import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";

const STORE_PARAMETER_NAME = "codegov-runner_replica-shared_data";
const AWS_REGION = "eu-west-1";

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
  const client = new SecretsManagerClient({ region: AWS_REGION });

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
  const client = new SSMClient({ region: AWS_REGION });
  const command = new GetParameterCommand({ Name: STORE_PARAMETER_NAME });

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

export const putParameterCommand = async (newStoredData) => {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/classes/putparametercommand.html
  const client = new SSMClient({ region: AWS_REGION });
  const input = {
    Name: STORE_PARAMETER_NAME,
    Value: JSON.stringify(newStoredData),
    Overwrite: true,
  };
  const command = new PutParameterCommand(input);

  let response;
  try {
    response = await client.send(command);
  } catch (error) {
    console.log(JSON.stringify(error));
    process.exit(1);
  }

  const hasVersion = response?.Version;
  if (!hasVersion) {
    console.log(
      "Error, Failed to update Stored Data: " + JSON.stringify(response),
    );
  }

  return !!hasVersion;
};
