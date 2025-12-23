import { Request, RequestHandler } from 'express';
import pinoHttp from 'pino-http';
import logger from '../utils/logger';

export const loggerMiddleware: RequestHandler = pinoHttp({
  logger,
  genReqId: (req: Request) => req.traceId || req.id,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: (req, _) => {
    return `${req.method} ${req.url} completed`;
  },
  customErrorMessage: (req, _, __) => {
    return `${req.method} ${req.url} errored`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'responseTime',
  },
  // Add traceId to all logs
  customProps: (req: Request) => {
    return { traceId: req.traceId };
  },
});
