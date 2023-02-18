import { RequestHandler } from 'express';

/**
 * This middleware is required for async functions to properly pass
 * rejected promise errors to the Express v4 error handler.
 */
export const asyncHandler =
    (handler: RequestHandler): RequestHandler =>
    async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
