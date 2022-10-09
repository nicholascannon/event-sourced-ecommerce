import { ErrorRequestHandler } from 'express';
import { logger } from '../../shared/logger';
import { ValidationError } from '../../shared/validation';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.errors });
    }

    logger.error('Internal server error', error);
    return res.sendStatus(500);
};
