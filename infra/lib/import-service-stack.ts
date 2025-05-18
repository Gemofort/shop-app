import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import path from 'path';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, 'ImportBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Note: only use DESTROY for development
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['https://d1kjvqhr8by4h7.cloudfront.net'],
          allowedHeaders: ['*'],
          exposedHeaders: [
            'ETag',
            'x-amz-server-side-encryption',
            'x-amz-request-id',
            'x-amz-id-2',
          ],
          maxAge: 3000,
        },
      ],
    });

    // Create Lambda function for file upload
    const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'import-products.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './handlers')),
      environment: {
        BUCKET_NAME: importBucket.bucketName
      }
    });

    // Create Lambda function for file parsing
    const importFileParser = new lambda.Function(this, 'ImportFileParser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'import-file-parser.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './handlers')),
      environment: {
        BUCKET_NAME: importBucket.bucketName
      }
    });

    // Grant permissions
    importBucket.grantReadWrite(importProductsFile);
    importBucket.grantRead(importFileParser);

    // Configure S3 event trigger
    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: 'uploaded/' }
    );

    const api = new apigateway.RestApi(this, 'ImportProductsApi', {
      restApiName: 'Import Products Service',
      description: 'API for importing products'
    });

    const importProductsIntegration = new apigateway.LambdaIntegration(importProductsFile);

    api.root.addResource('import')
      .addMethod('GET', importProductsIntegration);
  }
}
