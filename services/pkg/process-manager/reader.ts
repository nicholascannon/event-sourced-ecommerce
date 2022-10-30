import { Bookmark } from '../event-store/bookmark';
import { BaseEvent, PersistedEvent } from '../event-store/events';
import { EventStore } from '../event-store/generic-event-store';

export interface Reader<E extends BaseEvent> {
    readEvents: (batchSize: number) => Promise<PersistedEvent<E>[]>;
}

/**
 * Reads events in order from the event store and keeps track of where it has read
 * up to (bookmarked).
 */
export class BookmarkedEventReader<E extends BaseEvent> implements Reader<E> {
    private currentBookmark: Bookmark;

    constructor(startingBookmark: Bookmark, private readonly eventStore: EventStore<E>) {
        this.currentBookmark = startingBookmark;
    }

    /**
     * Returns a batch of events and updates the bookmark to the last event in the batch.
     * This is **not** a pure function so subsequent calls will **not** return the same
     * events by design.
     */
    async readEvents(batchSize: number): Promise<PersistedEvent<E>[]> {
        const events = await this.eventStore.loadEvents(this.currentBookmark, batchSize);
        if (events.length > 0) {
            this.currentBookmark = { id: events[0].id, insertingTxid: events[0].insertingTXID };
        }

        return events;
    }
}