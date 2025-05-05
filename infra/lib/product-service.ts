import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

// import { ProductServiceStackProps } from '../interfaces/product-service-stack-props';

export class ProductService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Products table
    const productsTable = new dynamodb.Table(this, 'Products', {
      tableName: 'Products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    // Stock table
    const stockTable = new dynamodb.Table(this, 'Stock', {
      tableName: 'Stock',
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
    });

    const productListFunction = new lambda.Function(
      this,
      'product-list-function',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: 'product-list.main',
        code: lambda.Code.fromAsset(path.join(__dirname, './handlers')),
        environment: {
          PRODUCTS_TABLE_NAME: productsTable.tableName,
          STOCK_TABLE_NAME: stockTable.tableName,
        },
      },
    );

    const createProductFunction = new lambda.Function(
      this,
      'create-product-function',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: 'create-product.main',
        code: lambda.Code.fromAsset(path.join(__dirname, './handlers')),
        environment: {
          PRODUCTS_TABLE_NAME: productsTable.tableName,
          STOCK_TABLE_NAME: stockTable.tableName,
        },
      },
    );

    const productDetailsFunction = new lambda.Function(
      this,
      'product-details-function',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: 'product-details.main',
        code: lambda.Code.fromAsset(path.join(__dirname, './handlers')),
        environment: {
          PRODUCTS_TABLE_NAME: productsTable.tableName,
          STOCK_TABLE_NAME: stockTable.tableName,
        },
      },
    );

    const api = new apigateway.RestApi(this, 'my-shop-api', {
      restApiName: 'My shop API Gateway',
      description: 'This API serves the Lambda functions.',
    });

    const productListLambdaIntegration = new apigateway.LambdaIntegration(
      productListFunction,
      {
        integrationResponses: [
          // Add mapping for successful response
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': `'https://d1kjvqhr8by4h7.cloudfront.net'`,
              'method.response.header.Access-Control-Allow-Headers':
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              'method.response.header.Access-Control-Allow-Methods':
                "'GET,OPTIONS'",
            },
          },
        ],
        proxy: false,
      },
    );

    const createProductLambdaIntegration = new apigateway.LambdaIntegration(
      createProductFunction,
    );

    const productDetailsLambdaIntegration = new apigateway.LambdaIntegration(
      productDetailsFunction,
    );

    // GET - products
    const productsResource = api.root.addResource('products');

    productsResource.addMethod('GET', productListLambdaIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          },
        },
      ],
    });

    // POST - products
    productsResource.addMethod('POST', createProductLambdaIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          },
        },
        {
          statusCode: '400',
        }
      ],
    });

    productsResource.addCorsPreflight({
      allowOrigins: ['https://d1kjvqhr8by4h7.cloudfront.net/'],
      allowMethods: ['GET', 'POST'],
    });


    // GET - products/{product_id}
    const productDetailsResource = productsResource.addResource('{product_id}');

    productDetailsResource.addMethod('GET', productDetailsLambdaIntegration, {
      methodResponses: [
        { statusCode: '200' },
        { statusCode: '400' },
        { statusCode: '404' },
      ],
    });

    productDetailsResource.addCorsPreflight({
      allowOrigins: ['https://d1kjvqhr8by4h7.cloudfront.net/'],
      allowMethods: ['GET'],
    });

    new cdk.CfnOutput(this, 'API Gateway URL', {
      value: api.url ?? 'Something went wrong',
    });

    // POST /products
    productsTable.grantWriteData(createProductFunction);
    stockTable.grantWriteData(createProductFunction);

    // GET /products
    productsTable.grantReadData(productListFunction);
    stockTable.grantReadData(productListFunction);

    // GET /products/{product_id}
    productsTable.grantReadData(productDetailsFunction);
    stockTable.grantReadData(productDetailsFunction);
  }
}
