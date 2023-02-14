import { DomainEvent, DomainEventStore } from '../../domain/domain-event-store';
import { Bookmark } from '../../event-store/bookmark';
import { PersistedEvent } from '../../event-store/events';

export class MemoryEventStore implements DomainEventStore {
    private events: PersistedEvent<DomainEvent>[] = [];

    constructor(seedData?: DomainEvent[]) {
        if (seedData) {
            const persistedSeedData = seedData.map<PersistedEvent<DomainEvent>>((e, idx) => ({
                id: String(idx + 1),
                insertingTxid: String(idx + 1),
                ...e,
                timestamp: String(new Date()),
            }));
            this.events.push(...persistedSeedData);
        }
    }

    async loadStream<E extends DomainEvent>(id: string, streamType: E['streamType']): Promise<PersistedEvent<E>[]> {
        return this.events.filter((e) => e.streamId === id && e.streamType === streamType) as PersistedEvent<E>[];
    }

    async loadEvents(from: Bookmark, batchSize: number): Promise<PersistedEvent<DomainEvent>[]> {
        return this.events.filter((e) => e.id > from.id).slice(0, batchSize);
    }

    async save(event: DomainEvent) {
        const stream = await this.loadStream(event.streamId, event.streamType);
        const conflict = stream.find((e) => e.version === event.version);

        if (conflict) {
            throw new Error('Event conflict');
        }

        this.events.push({
            id: String(this.events.length + 1),
            insertingTxid: String(this.events.length + 1),
            timestamp: String(new Date()),
            ...event,
        });
    }
}
