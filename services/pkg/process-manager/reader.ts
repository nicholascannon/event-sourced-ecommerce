import { BaseEvent, PersistedEvent } from '../event-store/events';

export interface Reader<E extends BaseEvent> {
    readEvents: (batchSize: number) => Promise<PersistedEvent<E>[]>;
}
