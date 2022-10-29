export interface BaseEvent {
    streamId: string;
    version: number;
    streamType: string;
    eventType: string;
}

/**
 * The PersistedEvent represents an event that has been saved to the event store.
 * It extends any event that extends BaseEvent and adds fields that are generated
 * by the event store when saved.
 *
 * Yes this type has `insertingTXID` which is tied to a specific Postgres Eventstore
 * implementation. We are taking this cost on to reduce complexity.
 */
export type PersistedEvent<T extends BaseEvent> = T & {
    id: string;
    insertingTXID: string;
    timestamp: Date;
};
