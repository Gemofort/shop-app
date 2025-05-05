// import { Construct } from 'constructs';
// import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

// export class DatabaseService extends Construct {
//   public readonly productsTable: dynamodb.Table;
//   public readonly stockTable: dynamodb.Table;

//   constructor(scope: Construct, id: string) {
//     super(scope, id);

//     // Products table
//     this.productsTable = new dynamodb.Table(this, 'Products', {
//       tableName: 'products',
//       partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
//     });

//     // Stock table
//     this.stockTable = new dynamodb.Table(this, 'Stock', {
//       tableName: 'stock',
//       partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
//     });
//   }
// }
