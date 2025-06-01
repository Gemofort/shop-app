import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import path from 'path';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create IAM role for Lambda
    const lambdaRole = new iam.Role(this, 'BasicAuthorizerLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Create Lambda function for basic authorization
    const basicAuthorizer = new lambda.Function(this, 'BasicAuthorizer', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'basic-authorizer.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './handlers')),
      role: lambdaRole,
      environment: {
        [process.env.GITHUB_USERNAME || 'gemofort']: process.env.TEST_PASSWORD || '123321',
      },
    });

    // Output the Lambda function ARN
    new cdk.CfnOutput(this, 'BasicAuthorizerLambdaArn', {
      value: basicAuthorizer.functionArn,
      description: 'ARN of the Basic Authorizer Lambda function',
    });
  }
}
