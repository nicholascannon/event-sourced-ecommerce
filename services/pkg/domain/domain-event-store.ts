import { EventStore, EventStoreReader, EventStoreWriter } from '../event-store/generic-event-store';
import { OrderEvent } from './order/order-events';

// DomainEvent would be the union of all domain events: OrderEvent | PurchaseEvent etc.
export type DomainEvent = OrderEvent;
export type DomainEventStore = EventStore<DomainEvent>;
export type DomainEventStoreReader = EventStoreReader<DomainEvent>;
export type DomainEventStoreWriter = EventStoreWriter<DomainEvent>;
