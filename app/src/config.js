import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// CONST
export const SERVER_IP = "37.27.9.86";
export const getHetznerSSH = async () => {
  // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
  const secret_name = "code-gov/runner-replica/hetzner-ssh-key";
  const client = new SecretsManagerClient({ region: "eu-north-1" });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({ SecretId: secret_name })
    );
  } catch (error) {
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    console.log(JSON.stringify(error));
    process.exit(1);
  }

  const secret = response.SecretString;
  return secret;
};
