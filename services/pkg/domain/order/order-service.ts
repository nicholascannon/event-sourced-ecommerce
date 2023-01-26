import { ProductIntegration } from '../../integrations/product/product-integration';
import { DomainEventStore } from '../domain-event-store';
import { Order } from './order';
import { AlreadyCheckedOutError, InvalidOrderItemError, OrderDoesNotExist } from './order-errors';
import { OrderEvent } from './order-events';

export class OrderService {
    constructor(
        private readonly eventStore: DomainEventStore,
        private readonly productIntegration: ProductIntegration
    ) {}

    async addItem(orderId: string, itemId: string): Promise<AddItemResponse> {
        // NOTE: I would add a check in here to ensure a user doesn't have another in-progress
        // order with a different id (creating 2 orders) but that is skipped for this demo.
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'CUSTOMER_ORDER');
        const order = new Order(orderId).buildFrom(events);

        if (order.status !== 'IN_PROGRESS') {
            throw new AlreadyCheckedOutError(orderId);
        }
        if (order.hasItem(itemId)) {
            return 'DUPLICATE_ITEM';
        }

        const item = await this.productIntegration.getProduct(itemId);
        if (item === undefined) {
            throw new InvalidOrderItemError([itemId]);
        }

        await this.eventStore.save({
            streamId: orderId,
            streamType: 'CUSTOMER_ORDER',
            eventType: 'ORDER_ITEM_ADDED',
            version: order.version + 1,
            payload: { itemId: item.id, name: item.name },
        });

        if (order.version === 0) {
            return 'CREATED_ORDER';
        }

        return 'SUCCESS';
    }

    async getOrder(orderId: string): Promise<Order | undefined> {
        // NOTE: this should use an order read model but out of scope
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'CUSTOMER_ORDER');
        const order = new Order(orderId).buildFrom(events);

        if (order.version === 0) {
            return undefined;
        }
        return order;
    }

    async getOrders(): Promise<Order[]> {
        // NOTE: this shuold use another readmodel that builds a customerId -> orders[]
        // model to be queried. This is out of scope as we only deal with 1 customer so
        // we just need to get all the orders in the eventstore.
        return [];
    }

    async checkout(orderId: string): Promise<void> {
        const events = await this.eventStore.loadStream<OrderEvent>(orderId, 'CUSTOMER_ORDER');
        const order = new Order(orderId).buildFrom(events);

        if (order.version === 0) {
            throw new OrderDoesNotExist(orderId);
        }
        if (order.status !== 'IN_PROGRESS') {
            throw new AlreadyCheckedOutError(orderId);
        }

        const orderItems = await Promise.all(order.items.map(({ id }) => this.productIntegration.getProduct(id)));

        // Check if we have an invalid item in the order
        const invalidItems = orderItems.reduce<string[]>((prev, curr, idx) => {
            if (curr === undefined) {
                prev.push(order.items[idx].id);
                return prev;
            }
            return prev;
        }, []);

        if (invalidItems.length !== 0) {
            throw new InvalidOrderItemError(invalidItems);
        }

        const totalPrice = orderItems.reduce((total, item) => {
            if (item === undefined) {
                return total;
            }
            return total + item.price;
        }, 0);

        await this.eventStore.save({
            streamId: orderId,
            streamType: 'CUSTOMER_ORDER',
            eventType: 'ORDER_CHECKED_OUT',
            version: order.version + 1,
            payload: { totalPrice },
        });
    }
}

type AddItemResponse = 'SUCCESS' | 'CREATED_ORDER' | 'DUPLICATE_ITEM';
