import { DomainEvent, DomainEventStore } from '../../domain/domain-event-store';
import { OrderEvent } from '../../domain/order/order-events';
import { Bookmark } from '../../event-store/bookmark';
import { PersistedEvent } from '../../event-store/events';

export class MemoryEventStore implements DomainEventStore {
    private events: DomainEvent[] = [];

    constructor(seedData?: DomainEvent[]) {
        if (seedData) {
            this.events.push(...seedData);
        }
    }

    async loadStream<E extends OrderEvent>(id: string, streamType: E['streamType']): Promise<PersistedEvent<E>[]> {
        return this.events.filter((e) => e.streamId === id && e.streamType === streamType) as PersistedEvent<E>[];
    }

    async loadEvents(_from: Bookmark, _batchSize: number): Promise<PersistedEvent<OrderEvent>[]> {
        // TODO: implement the following if required for tests
        throw new Error('Has not been implemented');
    }

    async save(event: OrderEvent) {
        const stream = await this.loadStream(event.streamId, event.streamType);
        const conflict = stream.find((e) => e.version === event.version);

        if (conflict) {
            throw new Error('Event conflict');
        }

        this.events.push(event);
    }
}
