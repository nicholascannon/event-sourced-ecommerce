import { ProductIntegration } from '../../integrations/product/product-integration';
import { DomainEventStore } from '../domain-event-store';
import { Order } from './order';
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
            return 'ORDER_CHECKED_OUT';
        }
        if (order.hasItem(itemId)) {
            return 'DUPLICATE_ITEM';
        }

        const item = await this.productIntegration.getProduct(itemId);
        if (item === undefined) {
            return 'INVALID_ITEM';
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

    async checkout(orderId: string): Promise<CheckoutResponse> {
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'ORDER_FLOW');
        const order = new Order(orderId).buildFrom(events);

        if (order.status !== 'IN_PROGRESS') {
            return 'ALREADY_CHECKED_OUT';
        }

        const orderItems = await Promise.all(order.items.map((itemId) => this.productIntegration.getProduct(itemId)));
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

        return 'SUCCESS';
    }
}

type AddItemResponse = 'SUCCESS' | 'CREATED_ORDER' | 'DUPLICATE_ITEM' | 'INVALID_ITEM' | 'ORDER_CHECKED_OUT';

type CheckoutResponse = 'SUCCESS' | 'ALREADY_CHECKED_OUT';
