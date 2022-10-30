import { logger } from '../pkg/shared/logger';
import { AjvValidator } from '../pkg/shared/validation';

export const CONFIG = (() => {
    const validator = new AjvValidator<Config>({
        type: 'object',
        properties: {
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
        },
        required: ['database'],
        additionalProperties: false,
    });

    try {
        return validator.validate({
            database: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                port: Number(process.env.DB_PORT),
                database: process.env.DB_DATABASE,
            },
        });
    } catch (error) {
        logger.error('Configuration error', error);
        throw error; // bubble up to end process
    }
})();

export interface Config {
    database: {
        host: string;
        user: string;
        password: string;
        port: number;
        database: string;
    };
}