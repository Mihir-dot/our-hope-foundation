import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { env, hasS3 } from '../config/env.js';
import { logger } from './logger.js';

const ses =
  env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? new SESv2Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!ses) {
    logger.info({ to: opts.to, subject: opts.subject }, 'Email (dev log — SES not configured)');
    logger.debug({ html: opts.html });
    return { ok: true as const, mocked: true };
  }

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: `Our Hope Foundation <${env.SES_FROM_EMAIL}>`,
      Destination: { ToAddresses: [opts.to] },
      Content: {
        Simple: {
          Subject: { Data: opts.subject },
          Body: {
            Html: { Data: opts.html },
            Text: { Data: opts.text || opts.subject },
          },
        },
      },
    }),
  );

  return { ok: true as const, mocked: false };
}

export function hasMail(): boolean {
  return Boolean(ses) || !hasS3;
}
