import pino from 'pino';

// Single shared logger for the whole app (lib/email.ts already had its own
// instance). Redact fields that should never end up in log output even if a
// caller accidentally logs a whole request/user/payment object.
export const logger = pino({
  name: 'app',
  redact: {
    paths: [
      'password',
      'passwordHash',
      '*.password',
      '*.passwordHash',
      'token',
      '*.token',
      'req.headers.authorization',
      'req.headers.cookie',
      '*.stripeSecretKey',
      '*.cardNumber',
    ],
    censor: '[redacted]',
  },
});
