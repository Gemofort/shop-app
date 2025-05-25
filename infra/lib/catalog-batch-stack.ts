import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import path from 'path';

export class CatalogBatchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create SNS Topic
    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      displayName: 'Create Product Topic',
      topicName: 'create-product-topic'
    });

    // Add email subscription
    createProductTopic.addSubscription(
      new subscriptions.EmailSubscription('vanya6677@gmail.com')
    );

    // Create SQS Queue
    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue',
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    // Create Lambda function for processing queue messages
    const catalogBatch = new lambda.Function(this, 'CatalogBatch', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'catalog-batch.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './handlers')),
      environment: {
        QUEUE_URL: catalogItemsQueue.queueUrl,
        PRODUCTS_TABLE_NAME: 'Products',
        CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn,
      },
    });

    // Grant Lambda permissions to access SQS
    catalogItemsQueue.grantConsumeMessages(catalogBatch);

    // Grant Lambda permissions to access DynamoDB
    catalogBatch.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Scan',
        'dynamodb:Query',
      ],
      resources: ['*'],
    }));

    // Grant Lambda permissions to publish to SNS
    createProductTopic.grantPublish(catalogBatch);

    // Add SQS trigger to Lambda
    catalogBatch.addEventSource(new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
      batchSize: 5,
    }));

    const api = new apigateway.RestApi(this, 'CatalogBatchApi', {
      restApiName: 'Catalog Batch Service',
      description: 'API for catalog batch'
    });

    const catalogBatchIntegration = new apigateway.LambdaIntegration(catalogBatch);

    api.root.addResource('catalog-batch')
      .addMethod('POST', catalogBatchIntegration);

    // Export the SNS topic ARN
    new cdk.CfnOutput(this, 'CreateProductTopicArn', {
      value: createProductTopic.topicArn,
      exportName: 'CreateProductTopicArn'
    });
  }
}
