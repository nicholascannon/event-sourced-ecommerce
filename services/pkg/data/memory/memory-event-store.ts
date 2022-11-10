import { DomainEvent, DomainEventStore } from '../../domain/domain-event-store';
import { OrderEvent } from '../../domain/order/order-events';
import { Bookmark } from '../../event-store/bookmark';
import { PersistedEvent } from '../../event-store/events';

export class MemoryEventStore implements DomainEventStore {
    private events: PersistedEvent<DomainEvent>[] = [];

    constructor(seedData?: DomainEvent[]) {
        if (seedData) {
            const persistedSeedData = seedData.map<PersistedEvent<DomainEvent>>((e, idx) => ({
                id: String(idx + 1),
                insertingTXID: String(idx + 1),
                ...e,
                timestamp: new Date(),
            }));
            this.events.push(...persistedSeedData);
        }
    }

    async loadStream<E extends OrderEvent>(id: string, streamType: E['streamType']): Promise<PersistedEvent<E>[]> {
        return this.events.filter((e) => e.streamId === id && e.streamType === streamType) as PersistedEvent<E>[];
    }

    async loadEvents(from: Bookmark, batchSize: number): Promise<PersistedEvent<OrderEvent>[]> {
        return this.events.filter((e) => e.id > from.id).slice(0, batchSize);
    }

    async save(event: OrderEvent) {
        const stream = await this.loadStream(event.streamId, event.streamType);
        const conflict = stream.find((e) => e.version === event.version);

        if (conflict) {
            throw new Error('Event conflict');
        }

        this.events.push({
            id: String(this.events.length + 1),
            insertingTXID: String(this.events.length + 1),
            timestamp: new Date(),
            ...event,
        });
    }
}
