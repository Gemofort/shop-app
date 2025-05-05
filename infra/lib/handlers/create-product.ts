import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const stockTableName = process.env.STOCK_TABLE_NAME as string;
const AWS_REGION = process.env.AWS_REGION as string;

const client = new DynamoDBClient({ region: AWS_REGION });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const main = async (event: any) => {
  console.log('Create product event:', JSON.stringify(event, null, 2));

  const body = JSON.parse(event.body || '{}');
  const { title, description, price, count } = body;

  console.log(`Body: ${JSON.stringify(body)}`);

  if (!title || !price || count == null) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: "Missing required fields." }),
    };
  }

  const id = crypto.randomUUID();

  try {
    const transactionResult = await client.send(new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: productsTableName,
            Item: marshall({ id, title, description, price }, { removeUndefinedValues: true }),
          }
        },
        {
          Put: {
            TableName: stockTableName,
            Item: marshall({ product_id: id, count }, { removeUndefinedValues: true }),
          }
        }
      ]
    }));

    console.log('Transaction succeeded:', JSON.stringify(transactionResult, null, 2));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ id, title, description, price, count }),
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: "Failed to create product" }),
    };
  }
};
