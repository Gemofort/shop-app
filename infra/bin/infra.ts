#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DeployWebAppStack } from '../lib/deploy-web-app-stack';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ImportServiceStack } from '../lib/import-service-stack';
import { CatalogBatchStack } from '../lib/catalog-batch-stack';
import { AuthorizationServiceStack } from '../lib/authorization-service-stack';

const app = new cdk.App();

// Deploy AuthorizationServiceStack first
const authStack = new AuthorizationServiceStack(app, 'AuthorizationServiceStack');

// Deploy ImportServiceStack
const importStack = new ImportServiceStack(app, 'ImportServiceStack');

// Add dependency to ensure AuthorizationServiceStack is deployed first
importStack.addDependency(authStack);

new DeployWebAppStack(app, 'DeployTestAppStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new ProductServiceStack(app, 'ProductServiceStack');

new CatalogBatchStack(app, 'CatalogBatchStack');
