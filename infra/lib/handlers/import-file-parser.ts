import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import csv from 'csv-parser';

const s3Client = new S3Client({});

export const main = async (event: S3Event): Promise<void> => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const getObjectResponse = await s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    const s3Stream = getObjectResponse.Body as Readable;

    await new Promise((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', (data) => {
          console.log('Parsed record:', JSON.stringify(data));
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
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
