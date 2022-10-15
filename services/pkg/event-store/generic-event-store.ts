import { BaseEvent } from './events';

export interface EventStore<Event extends BaseEvent> {
    /**
     * Loads a stream of events and narrows the type down to events only with
     * that stream type.
     */
    loadStream: <E extends Event>(id: string, streamType: E['streamType']) => Promise<E[]>;
    save: (event: Event) => Promise<void>;
}
