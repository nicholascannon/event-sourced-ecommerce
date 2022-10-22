import { MemoryEventStore } from '../../data/memory/memory-event-store';
import { MockProductIntegration, Product, ProductIntegration } from '../../integrations/product/product-integration';
import { DomainEventStore } from '../domain-event-store';
import { AlreadyCheckedOutError, InvalidOrderItemError, OrderNotFoundError } from './order-errors';
import { OrderService } from './order-service';

describe('OrderService', () => {
    let eventStore: DomainEventStore;
    let service: OrderService;
    let productInt: ProductIntegration;
    let products: Product[] = [
        {
            id: 'item-id-1',
            name: 'Item 1',
            price: 5.0,
        },
        {
            id: 'item-id-2',
            name: 'Item 2',
            price: 10.0,
        },
    ];

    beforeEach(() => {
        eventStore = new MemoryEventStore();
        productInt = new MockProductIntegration(products);
        service = new OrderService(eventStore, productInt);
    });

    describe('addItem', () => {
        it('should add the item and create order when no events exist', async () => {
            const orderId = 'order-id';

            const response = await service.addItem(orderId, products[0].id);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(response).toBe('CREATED_ORDER');
            expect(stream).toEqual([
                {
                    streamId: orderId,
                    streamType: 'ORDER_FLOW',
                    eventType: 'ORDER_ITEM_ADDED',
                    version: 1,
                    payload: { itemId: products[0].id },
                },
            ]);
        });

        it('should add new item when existing item is different', async () => {
            const orderId = 'order-id';

            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
            });
            const response = await service.addItem(orderId, products[1].id);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(response).toBe('SUCCESS');
            expect(stream[1]).toEqual({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 2,
                payload: { itemId: products[1].id },
            });
        });

        it('should mark existing item as duplicate', async () => {
            const orderId = 'order-id';

            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
            });
            const response = await service.addItem(orderId, products[0].id);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(response).toBe('DUPLICATE_ITEM');
            expect(stream.length).toBe(1);
        });

        it('should not allow items to be added to orders already checked out (not in progress orders)', async () => {
            const orderId = 'order-id';

            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CHECKED_OUT',
                version: 2,
                payload: {
                    totalPrice: 5.0,
                },
            });
            expect(async () => service.addItem(orderId, products[0].id)).rejects.toThrowError(AlreadyCheckedOutError);
        });

        it('should error when adding an invalid item to the order', async () => {
            expect(async () => service.addItem('order-id', 'invalid-product-id')).rejects.toThrowError(
                InvalidOrderItemError
            );
        });
    });

    describe('getItem', () => {
        it('should return undefined if order doesnt exist', async () => {
            const order = await service.getOrder('id');
            expect(order).toBeUndefined();
        });

        it('should get a hydrated order when events exist for that order id', async () => {
            const orderId = 'order-id';

            // Add item
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
            });

            // Checkout order
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CHECKED_OUT',
                version: 2,
                payload: {
                    totalPrice: 5.0,
                },
            });

            const order = await service.getOrder(orderId);
            expect(order?.id).toBe(orderId);
            expect(order?.items).toEqual([products[0].id]);
            expect(order?.version).toBe(2);
            expect(order?.status).toBe('CHECKED_OUT');
        });
    });

    describe('checkout', () => {
        it('should checkout a valid order with one item', async () => {
            const orderId = 'order-id';

            // Add item
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
            });

            await service.checkout(orderId);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(stream[1]).toEqual({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CHECKED_OUT',
                version: 2,
                payload: {
                    totalPrice: products[0].price,
                },
            });
        });

        it('should checkout a valid order with multiple items', async () => {
            const orderId = 'order-id';

            // Add items
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
            });
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 2,
                payload: { itemId: products[1].id },
            });

            await service.checkout(orderId);
            const stream = await eventStore.loadStream(orderId, 'ORDER_FLOW');

            expect(stream[2]).toEqual({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CHECKED_OUT',
                version: 3,
                payload: {
                    totalPrice: products[0].price + products[1].price,
                },
            });
        });

        it('should fail to checkout an order that does not exist', async () => {
            expect(async () => service.checkout('non-existent-order')).rejects.toThrowError(OrderNotFoundError);
        });

        it('should not checkout an order twice', async () => {
            const orderId = 'order-id';

            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_CHECKED_OUT',
                version: 2,
                payload: {
                    totalPrice: 5,
                },
            });

            expect(async () => service.checkout(orderId)).rejects.toThrowError(AlreadyCheckedOutError);
        });

        it('should not checkout an order with invalid items', async () => {
            const orderId = 'order-id';

            // Add some valid items
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                payload: { itemId: products[0].id },
            });
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 2,
                payload: { itemId: products[1].id },
            });

            // Item saved here was valid but at time of checkout it's invalid
            await eventStore.save({
                streamId: orderId,
                streamType: 'ORDER_FLOW',
                eventType: 'ORDER_ITEM_ADDED',
                version: 3,
                payload: {
                    itemId: 'item-id',
                },
            });

            expect(async () => service.checkout(orderId)).rejects.toThrowError(InvalidOrderItemError);
        });
    });
});
