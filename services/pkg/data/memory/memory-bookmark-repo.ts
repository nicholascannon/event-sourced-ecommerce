import { Bookmark, bookmarkValidator } from '../../event-store/bookmark';
import { BookmarkRepo } from '../../process-manager/bookmark';

export class MemoryBookmarkRepo implements BookmarkRepo<Bookmark> {
    private bookmark: Bookmark | undefined;

    constructor() {}

    async get(): Promise<Bookmark> {
        if (!this.bookmark) {
            return { id: '0', insertingTxid: '0' };
        }
        return this.bookmark;
    }

    async set(bookmark: Bookmark) {
        bookmarkValidator.validate(bookmark);
        this.bookmark = bookmark;
    }
}
