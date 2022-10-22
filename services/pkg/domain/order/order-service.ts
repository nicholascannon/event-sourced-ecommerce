import { ProductIntegration } from '../../integrations/product/product-integration';
import { DomainEventStore } from '../domain-event-store';
import { Order } from './order';
import { AlreadyCheckedOutError, InvalidOrderItemError, OrderNotFoundError } from './order-errors';
import { OrderEvent } from './order-events';

export class OrderService {
    constructor(
        private readonly eventStore: DomainEventStore,
        private readonly productIntegration: ProductIntegration
    ) {}

    async addItem(orderId: string, itemId: string): Promise<AddItemResponse> {
        // NOTE: I would add a check in here to ensure a user doesn't have another in-progress
        // order with a different id (creating 2 orders) but that is skipped for this demo.
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'ORDER_FLOW');
        const order = new Order(orderId).buildFrom(events);

        if (order.status !== 'IN_PROGRESS') {
            throw new AlreadyCheckedOutError(orderId);
        }
        if (order.hasItem(itemId)) {
            return 'DUPLICATE_ITEM';
        }

        const item = await this.productIntegration.getProduct(itemId);
        if (item === undefined) {
            throw new InvalidOrderItemError(itemId);
        }

        await this.eventStore.save({
            streamId: orderId,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_ITEM_ADDED',
            version: order.version + 1,
            payload: { itemId },
        });

        if (order.version === 0) {
            return 'CREATED_ORDER';
        }

        return 'SUCCESS';
    }

    async getOrder(orderId: string): Promise<Order> {
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'ORDER_FLOW');
        return new Order(orderId).buildFrom(events);
    }

    async checkout(orderId: string): Promise<void> {
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'ORDER_FLOW');
        const order = new Order(orderId).buildFrom(events);

        if (order.version === 0) {
            throw new OrderNotFoundError(orderId);
        }
        if (order.status !== 'IN_PROGRESS') {
            throw new AlreadyCheckedOutError(orderId);
        }

        const orderItems = await Promise.all(order.items.map((itemId) => this.productIntegration.getProduct(itemId)));

        // Check if we have an invalid item in the order
        const invalidItems = orderItems.reduce<number[]>((prev, curr, idx) => {
            if (curr === undefined) {
                prev.push(idx);
                return prev;
            }
            return prev;
        }, []);

        if (invalidItems.length !== 0) {
            throw new InvalidOrderItemError(invalidItems.join(', '));
        }

        const totalPrice = orderItems.reduce((total, item) => {
            if (item === undefined) {
                return total;
            }
            return total + item.price;
        }, 0);

        await this.eventStore.save({
            streamId: orderId,
            streamType: 'ORDER_FLOW',
            eventType: 'ORDER_CHECKED_OUT',
            version: order.version + 1,
            payload: { totalPrice },
        });
    }
}

type AddItemResponse = 'SUCCESS' | 'CREATED_ORDER' | 'DUPLICATE_ITEM';
