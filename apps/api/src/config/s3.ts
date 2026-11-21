import { S3Client } from '@aws-sdk/client-s3';
import { env, hasS3 } from './env.js';

export const s3: S3Client | null = hasS3
  ? new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;
