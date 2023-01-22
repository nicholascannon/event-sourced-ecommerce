import { ErrorRequestHandler } from 'express';
import { AlreadyCheckedOutError, InvalidOrderItemError, OrderDoesNotExist } from '../../domain/order/order-errors';
import { logger } from '../../shared/logger';
import { ValidationError } from '../../shared/validation';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.errors });
    }

    // NOTE: If the app scales up, we should pull the domain specific errors into a special
    // domain specific express error handler. For now since we have 1 domain, let's leave here.
    if (error instanceof AlreadyCheckedOutError) {
        return res.status(403).json({ message: error.message, orderId: error.orderId });
    }
    if (error instanceof InvalidOrderItemError) {
        return res.status(400).json({ message: error.message, itemIds: error.itemIds });
    }
    if (error instanceof OrderDoesNotExist) {
        return res.status(404).json({ message: error.message, orderId: error.orderId });
    }

    logger.error('Internal server error', error);
    return res.sendStatus(500);
};
