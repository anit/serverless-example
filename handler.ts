// import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { config } from 'aws-sdk';
import * as Sentry from '@sentry/serverless';
import { S3 } from 'aws-sdk';
import { parseFormData, BUCKET_NAME } from './src/common';

Sentry.init({
  dsn: 'https://05a20094184b4087b4554b7be35dd2fb@cs-sentry.crowdstaffing.com/4',
});
config.update({ region: 'us-west-2' });
const s3Client = new S3();


export const uploadFile = async (event) => {
  const { file, fields } = await parseFormData(event);

  if (!file ) {
    return {
      statusCode: 401,
      body: JSON.stringify({ description: 'missing file field'})
    }
  }

  try {
    await s3Client
      .putObject({
        Bucket: BUCKET_NAME,
        Key: fields.filename || file?.filename,
        Body: file.content
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ description: 'file created', result: 'ok' }),
    };

  } catch (_error) {
    // this is deficient error handling, but good enough for the purpose of this example
    return {
      statusCode: 409, body: JSON.stringify({ description: 'something went wrong' })
    }
  }
};


exports.uploadFile = Sentry.AWSLambda.wrapHandler(uploadFile);
