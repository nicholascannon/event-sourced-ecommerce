import { BaseEvent, PersistedEvent } from './events';

export const removePersistedProps = <E extends BaseEvent>(events: PersistedEvent<E>[]) => {
    return events.map((persistedEvent) => {
        const { id, insertingTxid, timestamp, ...event } = persistedEvent;
        return event;
    });
};
