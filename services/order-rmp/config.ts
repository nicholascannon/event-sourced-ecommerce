import { logger } from '../pkg/shared/logger';
import { AjvValidator } from '../pkg/shared/validation';

export const CONFIG = (() => {
    const validator = new AjvValidator<Config>({
        type: 'object',
        properties: {
            reader: {
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
            writer: {
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
            batchSize: { type: 'integer', exclusiveMinimum: 0 },
        },
        required: ['reader', 'writer', 'batchSize'],
        additionalProperties: false,
    });

    try {
        return validator.validate({
            reader: {
                host: process.env.READER_DB_HOST,
                user: process.env.READER_DB_USER,
                password: process.env.READER_DB_PASSWORD,
                port: Number(process.env.READER_DB_PORT),
                database: process.env.READER_DB_DATABASE,
            },
            writer: {
                host: process.env.WRITER_DB_HOST,
                user: process.env.WRITER_DB_USER,
                password: process.env.WRITER_DB_PASSWORD,
                port: Number(process.env.WRITER_DB_PORT),
                database: process.env.WRITER_DB_DATABASE,
            },
            batchSize: Number(process.env.BATCH_SIZE),
        });
    } catch (error) {
        logger.error('Configuration error', error);
        throw error; // bubble up to end process
    }
})();

export interface Config {
    reader: DatabaseConfig;
    writer: DatabaseConfig;
    batchSize: number;
}

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    port: number;
    database: string;
}
