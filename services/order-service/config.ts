import { logger } from '../pkg/shared/logger';
import { AjvValidator } from '../pkg/shared/validation';

export const CONFIG = (() => {
    const validator = new AjvValidator<Config>({
        type: 'object',
        properties: {
            port: { type: 'integer', minimum: 1010, maximum: 65535 },
        },
        required: ['port'],
        additionalProperties: false,
    });

    try {
        return validator.validate({
            port: Number(process.env.PORT),
        });
    } catch (error) {
        logger.error('Configuration error', error);
        throw error; // bubble up to end process
    }
})();

export interface Config {
    port: number;
}
