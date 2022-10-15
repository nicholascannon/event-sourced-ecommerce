import { BaseEvent } from './events';

export interface EventStore<Event extends BaseEvent> {
    loadStream: (id: string, streamType: Event['streamType']) => Promise<Event[]>;
    save: (event: Event) => Promise<void>;
}
