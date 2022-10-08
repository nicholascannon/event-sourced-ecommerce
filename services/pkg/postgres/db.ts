import pg from 'pg';

export function createPool(config: pg.PoolConfig): pg.Pool {
    return new pg.Pool(config);
}
