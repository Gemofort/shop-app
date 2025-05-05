import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ProductService } from './product-service';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ProductService(this, 'ProductService');
  }
}
