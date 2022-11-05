import { BaseEvent, PersistedEvent } from './events';

export function removePersistedProps<E extends BaseEvent>(events: PersistedEvent<E>[]) {
    return events.map((persistedEvent) => {
        const { id, insertingTXID, timestamp, ...event } = persistedEvent;
        return event;
    });
}
