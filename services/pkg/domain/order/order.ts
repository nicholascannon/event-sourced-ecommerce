import { assertNever } from '../../shared/assert';
import { AddItemEvent, OrderEvent } from './order-events';

export class Order {
    private _version: number;
    private _status: OrderStatus;
    private _items: Set<string>;

    constructor(private readonly _id: string) {
        this._version = 0;
        this._items = new Set();
        this._status = 'IN_PROGRESS';
    }

    public get id(): string {
        return this._id;
    }

    public get version(): number {
        return this._version;
    }

    public get status(): OrderStatus {
        return this._status;
    }

    hasItem(itemId: string): boolean {
        return this._items.has(itemId);
    }

    buildFrom(events: OrderEvent[]) {
        events.forEach((event) => {
            switch (event.eventType) {
                case 'ORDER_ITEM_ADDED':
                    this.handleOrderItemAdded(event);
                    break;
                case 'ORDER_CHECKED_OUT':
                    this.handleStatusChange('CHECKED_OUT');
                    break;
                case 'ORDER_CONFIRMED':
                    this.handleStatusChange('CONFIRMED');
                    break;
                default:
                    assertNever(event);
            }

            this._version += 1;
        });
    }

    private handleOrderItemAdded(event: AddItemEvent) {
        this._items.add(event.payload.itemId);
    }

    private handleStatusChange(status: OrderStatus) {
        this._status = status;
    }
}

export type OrderStatus = 'IN_PROGRESS' | 'CHECKED_OUT' | 'CONFIRMED';
