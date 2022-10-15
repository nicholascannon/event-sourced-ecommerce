import pg from 'pg';
import { logger } from '../../shared/logger';

export function createPool(config: pg.PoolConfig): pg.Pool {
    const pool = new pg.Pool(config);
    pool.on('error', (err) => logger.error('Postgres pool error', err));
    return pool;
}
