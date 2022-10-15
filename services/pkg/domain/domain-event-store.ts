import { EventStore } from '../event-store/generic-event-store';
import { OrderEvent } from './order/order-events';

export type DomainEvent = OrderEvent;
export type DomainEventStore = EventStore<DomainEvent>;
