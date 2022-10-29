import { BaseEvent, PersistedEvent } from '../event-store/events';

export interface Consumer<E extends BaseEvent> {
    consumeEvents: (events: PersistedEvent<E>[]) => Promise<void>;
}
