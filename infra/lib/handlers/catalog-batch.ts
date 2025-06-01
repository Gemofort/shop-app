import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const createProductTopicArn = process.env.CREATE_PRODUCT_TOPIC_ARN as string;
const AWS_REGION = process.env.AWS_REGION as string;

const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const snsClient = new SNSClient({ region: AWS_REGION });

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

async function createProduct(product: Product): Promise<void> {
  console.log('Creating product:', JSON.stringify(product, null, 2));

  const dynamoItem = {
    id: { S: crypto.randomUUID() },
    title: { S: product.title },
    description: { S: product.description },
    price: { N: product.price.toString() },
    count: { N: product.count.toString() }
  };

  await dynamoClient.send(new PutItemCommand({
    TableName: productsTableName,
    Item: dynamoItem,
  }));

  // Publish to SNS
  await snsClient.send(new PublishCommand({
    TopicArn: createProductTopicArn,
    Message: JSON.stringify({
      id: dynamoItem.id.S,
      title: product.title,
      description: product.description,
      price: product.price,
      count: product.count
    }),
    MessageAttributes: {
      price: {
        DataType: 'Number',
        StringValue: product.price.toString(),
      },
      count: {
        DataType: 'Number',
        StringValue: product.count.toString(),
      }
    }
  }));
}

async function processRecord(record: SQSRecord): Promise<void> {
  try {
    const product: Product = JSON.parse(record.body);
    await createProduct(product);
    console.log(`Successfully processed product: ${product.id}`);
  } catch (error) {
    console.error('Error processing record:', error);
    throw error;
  }
}

export async function main(event: SQSEvent) {
  console.log('Processing SQS event:', JSON.stringify(event, null, 2));

  try {
    const promises = event.Records.map(record => processRecord(record));
    await Promise.all(promises);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully processed ${event.Records.length} records`,
      }),
    };
  } catch (error) {
    console.error('Error processing batch:', error);
    throw error;
  }
}
