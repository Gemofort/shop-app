import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const stockTableName = process.env.STOCK_TABLE_NAME as string;
const AWS_REGION = process.env.AWS_REGION as string;

const client = new DynamoDBClient({ region: AWS_REGION });

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function main(event: any) {
  console.log('Products list event:', JSON.stringify(event, null, 2));

  const productsData = await client.send(new ScanCommand({ TableName: productsTableName }));
  const products = productsData.Items?.map(item => unmarshall(item)) || [];

  const stockData = await client.send(new ScanCommand({ TableName: stockTableName }));
  const stockMap = new Map(
    (stockData.Items || []).map(item => {
      const data = unmarshall(item);
      return [data.product_id, data.count];
    })
  );

  const enriched = products.map(p => ({
    ...p,
    count: stockMap.get(p.id) ?? 0,
  }));

  console.log('GetItem for Products succeeded:', JSON.stringify(enriched, null, 2));

  return {
    statusCode: 200,
    body: enriched,
  };
}
