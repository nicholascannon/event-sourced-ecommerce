import { ErrorRequestHandler } from 'express';
import { AlreadyCheckedOutError, InvalidOrderItemError, OrderNotFoundError } from '../../domain/order/order-errors';
import { logger } from '../../shared/logger';
import { ValidationError } from '../../shared/validation';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    // NOTE: If the app scales up, we should pull the domain specific errors into a special
    // domain specific express error handler. For now since we have 1 domain, let's leave here.
    switch (error.constructor) {
        case ValidationError:
            return res.status(400).json({ message: error.errors });
        case AlreadyCheckedOutError:
            return res.sendStatus(403);
        case InvalidOrderItemError:
            return res.sendStatus(400);
        case OrderNotFoundError:
            return res.sendStatus(404);
    }

    logger.error('Internal server error', error);
    return res.sendStatus(500);
};
