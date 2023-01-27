import { OrderAggregate } from './order-aggregate';

describe('Order', () => {
    it('should initialise an empty Order correctly', () => {
        const order = new OrderAggregate('order-id');
        expect(order.id).toBe('order-id');
        expect(order.status).toBe('IN_PROGRESS');
        expect(order.version).toBe(0);
    });

    it('should handle item added events correctly', () => {
        const order = new OrderAggregate('order-id');
        order.buildFrom([
            {
                eventType: 'ORDER_ITEM_ADDED',
                version: 1,
                streamId: 'order-id',
                streamType: 'CUSTOMER_ORDER',
                payload: {
                    itemId: 'item-id',
                    name: 'item1',
                },
            },
            {
                eventType: 'ORDER_ITEM_ADDED',
                version: 2,
                streamId: 'order-id',
                streamType: 'CUSTOMER_ORDER',
                payload: {
                    itemId: 'item-id-2',
                    name: 'item2',
                },
            },
        ]);

        expect(order.hasItem('item-id')).toBeTruthy();
        expect(order.hasItem('item-id-2')).toBeTruthy();
        expect(order.items).toEqual([
            { id: 'item-id', name: 'item1' },
            { id: 'item-id-2', name: 'item2' },
        ]);
        expect(order.id).toBe('order-id');
        expect(order.version).toBe(2);
    });

    it('should handle checked out events correctly', () => {
        const order = new OrderAggregate('order-id');
        order.buildFrom([
            {
                eventType: 'ORDER_CHECKED_OUT',
                version: 1,
                streamId: 'order-id',
                streamType: 'CUSTOMER_ORDER',
                payload: {
                    totalPrice: 5.0,
                },
            },
        ]);

        expect(order.status).toBe('CHECKED_OUT');
        expect(order.id).toBe('order-id');
        expect(order.version).toBe(1);
        expect(order.totalPrice).toBe(5.0);
    });

    it('should handle order confirmed events correctly', () => {
        const order = new OrderAggregate('order-id');
        order.buildFrom([
            {
                eventType: 'ORDER_CONFIRMED',
                version: 1,
                streamId: 'order-id',
                streamType: 'CUSTOMER_ORDER',
                payload: {},
            },
        ]);

        expect(order.status).toBe('CONFIRMED');
        expect(order.id).toBe('order-id');
        expect(order.version).toBe(1);
    });

    it('should return false for item ids not in the order', () => {
        const order = new OrderAggregate('order-id');
        expect(order.hasItem('item-id')).toBeFalsy();
    });
});
