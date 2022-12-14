import { Bookmark } from './bookmark';
import { BaseEvent, PersistedEvent } from './events';

export interface EventStoreReader<Event extends BaseEvent> {
    /**
     * Loads a stream of events and narrows the type down to events only with
     * that stream type.
     */
    loadStream: <E extends Event>(id: string, streamType: E['streamType']) => Promise<PersistedEvent<E>[]>;

    /**
     * Loads `batchSize` of events from the bookmark position. Does not filter by
     * stream id or stream type.
     */
    loadEvents: (from: Bookmark, batchSize: number) => Promise<PersistedEvent<Event>[]>;
}

export interface EventStoreWriter<Event extends BaseEvent> {
    save: (event: Event) => Promise<void>;
}

export interface EventStore<Event extends BaseEvent> extends EventStoreReader<Event>, EventStoreWriter<Event> {}
