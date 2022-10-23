import { lifecycle } from '../pkg/shared/lifecycle';
import { logger } from '../pkg/shared/logger';

export async function startCheckoutPm() {
    const id = setInterval(() => logger.info('Checkout PM disabled'), 5_000);
    lifecycle.on('close', () => clearInterval(id));
}
