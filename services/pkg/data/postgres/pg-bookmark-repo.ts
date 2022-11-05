import pg from 'pg';
import { Bookmark } from '../../event-store/bookmark';
import { BookmarkRepo } from '../../process-manager/bookmark';
import { AjvValidator } from '../../shared/validation';

export class PgBookmarkRepo implements BookmarkRepo<Bookmark> {
    private static validator = new AjvValidator<Bookmark>({
        type: 'object',
        properties: {
            id: { type: 'string' },
            insertingTxid: { type: 'string' },
        },
        required: ['id', 'insertingTxid'],
        additionalProperties: false,
    });

    constructor(private readonly name: string, private readonly pool: pg.Pool) {}

    async get(): Promise<Bookmark> {
        const { rows } = await this.pool.query<{ value: string }>(
            `
                SELECT
                    value
                FROM order_context.bookmarks
                WHERE name=$1;
            `,
            [this.name]
        );

        if (rows.length === 0) {
            return { id: '0', insertingTxid: '0' };
        }
        return JSON.parse(rows[0].value);
    }

    async set(bookmark: Bookmark) {
        PgBookmarkRepo.validator.validate(bookmark);
        await this.pool.query(
            `
                INSERT INTO order_context.bookmarks(name, value)
                VALUES($1, $2)
                ON CONFLICT (name)
                DO UPDATE SET value=$2;
            `,
            [this.name, bookmark]
        );
    }
}
