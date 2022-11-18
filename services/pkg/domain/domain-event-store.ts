import { BaseEvent } from '../event-store/events';
import { EventStore, EventStoreReader, EventStoreWriter } from '../event-store/generic-event-store';
import { OrderEvent } from './order/order-events';

// DomainEvent would be the union of all domain events: OrderEvent | PurchaseEvent etc.
export type DomainEvent = OrderEvent | TestEvent;
export type DomainEventStore = EventStore<DomainEvent>;
export type DomainEventStoreReader = EventStoreReader<DomainEvent>;
export type DomainEventStoreWriter = EventStoreWriter<DomainEvent>;

/**
 * This event here is to just demo what it would be like for `DomainEvent`
 * above to be a union of more than one type of event for demos sake.
 *
 * It's not used anywhere and would be deleted if this were a real project.
 */
interface TestEvent extends BaseEvent {
    streamType: 'TEST';
    eventType: 'TEST_EVENT';
    payload: Record<string, never>;
}
