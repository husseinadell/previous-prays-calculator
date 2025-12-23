import pino from 'pino';
import { randomUUID } from 'crypto';

// Create logger instance with JSON formatting
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: label => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

// Logger with trace ID support
export const getLogger = (traceId?: string) => {
  const id = traceId || randomUUID();

  return logger.child({ traceId: id });
};

// Default logger (for use outside request context)
export default logger;
