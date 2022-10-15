import { DomainEvent, DomainEventStore } from '../../domain/domain-event-store';
import { OrderEvent } from '../../domain/order/order-events';

export class MemoryEventStore implements DomainEventStore {
    private events: DomainEvent[] = [];

    constructor(seedData?: DomainEvent[]) {
        if (seedData) {
            this.events.push(...seedData);
        }
    }

    async loadStream<E extends OrderEvent>(id: string, streamType: E['streamType']): Promise<E[]> {
        return this.events.filter((e) => e.streamId === id && e.streamType === streamType) as E[];
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
