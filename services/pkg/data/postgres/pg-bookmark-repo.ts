import pg from 'pg';
import { Bookmark, bookmarkValidator } from '../../event-store/bookmark';
import { BookmarkRepo } from '../../process-manager/bookmark';

export class PgBookmarkRepo implements BookmarkRepo<Bookmark> {
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
        bookmarkValidator.validate(bookmark);
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
