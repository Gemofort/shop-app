import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, StatementEffect } from 'aws-lambda';

export const main = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    if (!event.authorizationToken) {
      throw new Error('Unauthorized');
    }

    const encodedCreds = event.authorizationToken.split(' ')[1];
    if (!encodedCreds) {
      throw new Error('Unauthorized');
    }

    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    const [username, password] = decodedCreds.split(':');

    // Check if the credentials match the environment variable
    const storedPassword = process.env[username];
    if (!storedPassword || storedPassword !== password) {
      throw new Error('Forbidden');
    }

    // Generate policy
    return generatePolicy(username, 'Allow', event.methodArn);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return generatePolicy('user', 'Deny', event.methodArn, 401);
    }
    return generatePolicy('user', 'Deny', event.methodArn, 403);
  }
};

const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string,
  statusCode: number = 200
): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect as StatementEffect,
          Resource: resource,
        },
      ],
    },
    context: {
      statusCode: statusCode.toString(),
    },
  };
};
