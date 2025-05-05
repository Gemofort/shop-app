import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface ProductServiceStackProps extends cdk.StackProps {
  productsTable: dynamodb.ITable;
  stockTable: dynamodb.ITable;
}
