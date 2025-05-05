// import * as cdk from 'aws-cdk-lib';
// import { Construct } from 'constructs';
// import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
// import { DatabaseService } from './database-service';

// export class DatabaseStack extends cdk.Stack {
//   public readonly productsTable: dynamodb.Table;
//   public readonly stockTable: dynamodb.Table;

//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     const service = new DatabaseService(this, 'DatabaseService');

//     this.productsTable = service.productsTable;
//     this.stockTable = service.stockTable;
//   }
// }
