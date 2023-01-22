import { logger } from '../pkg/shared/logger';
import { AjvValidator } from '../pkg/shared/validation';

export const CONFIG = (() => {
    const validator = new AjvValidator<Config>({
        type: 'object',
        properties: {
            port: { type: 'integer', minimum: 1010, maximum: 65535 },
            database: {
                type: 'object',
                properties: {
                    host: { type: 'string' },
                    user: { type: 'string' },
                    password: { type: 'string' },
                    port: { type: 'integer', minimum: 1010, maximum: 65535 },
                    database: { type: 'string' },
                },
                required: ['host', 'user', 'password', 'port', 'database'],
                additionalProperties: false,
            },
            productServiceHost: { type: 'string' },
            corsOrigins: { type: 'array', items: { type: 'string' }, nullable: true },
        },
        required: ['port', 'database', 'productServiceHost'],
        additionalProperties: false,
    });

    try {
        return validator.validate({
            port: Number(process.env.PORT),
            database: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                port: Number(process.env.DB_PORT),
                database: process.env.DB_DATABASE,
            },
            productServiceHost: process.env.PRODUCT_SERVICE_HOST,
            corsOrigins: process.env.CORS_ORIGINS?.split(','),
        });
    } catch (error) {
        logger.error('Configuration error', error);
        throw error; // bubble up to end process
    }
})();

export interface Config {
    port: number;
    database: {
        host: string;
        user: string;
        password: string;
        port: number;
        database: string;
    };
    productServiceHost: string;
    corsOrigins?: string[];
}
