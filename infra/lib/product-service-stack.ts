import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ProductService } from './product-service';
import { ProductServiceStackProps } from '../interfaces/product-service-stack-props';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ProductServiceStackProps) {
    super(scope, id, props);

    new ProductService(this, 'ProductService');
  }
}
