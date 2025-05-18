import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const stockTableName = process.env.STOCK_TABLE_NAME as string;
const AWS_REGION = process.env.AWS_REGION as string;

const client = new DynamoDBClient({ region: AWS_REGION });
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function main(event: any) {
  const productId = event.pathParameters?.product_id;

  console.log('Products details event:', JSON.stringify(event, null, 2));

  if (!productId) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: "Product ID is required" }),
    };
  }

  const productRes = await client.send(new GetItemCommand({
    TableName: productsTableName,
    Key: { id: { S: productId } },
  }));

  if (!productRes.Item) {
    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  const stockRes = await client.send(new GetItemCommand({
    TableName: stockTableName,
    Key: { product_id: { S: productId } },
  }));

  const product = unmarshall(productRes.Item);
  const stock = stockRes.Item ? unmarshall(stockRes.Item) : { count: 0 };

  console.log('GetItem for Products succeeded:', JSON.stringify(product, null, 2));
  console.log('GetItem for Stock succeeded:', JSON.stringify(stock, null, 2));

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ...product, count: stock.count }),
  };
}
