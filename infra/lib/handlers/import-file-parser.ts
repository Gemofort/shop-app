import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Readable } from 'stream';
import csv from 'csv-parser';

const s3Client = new S3Client({});
const sqsClient = new SQSClient({});

export const main = async (event: S3Event): Promise<void> => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const queueUrl = process.env.QUEUE_URL;

    console.log('Queue URL:', queueUrl);

    if (!queueUrl) {
      throw new Error('QUEUE_URL environment variable is not set');
    }

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const getObjectResponse = await s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    const s3Stream = getObjectResponse.Body as Readable;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendMessagePromises: Promise<any>[] = [];

    await new Promise((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', (data) => {
          console.log('Sending message to SQS:', data);
          const promise = sqsClient.send(new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(data),
          })).then(response => {
            console.log('Response:', response);
          }).catch(error => {
            console.error('Error sending message to SQS:', error);
            reject(error);
          });
          sendMessagePromises.push(promise);
        })
        .on('error', (error) => {
          console.error('Error processing CSV:', error);
          reject(error);
        })
        .on('end', () => {
          console.log('CSV processing completed');
          resolve(true);
        });
    });

    await Promise.all(sendMessagePromises);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
