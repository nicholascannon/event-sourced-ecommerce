import { assertNever } from '../../shared/assert';
import { AddItemEvent, CheckedOutEvent, OrderEvent } from './order-events';

export class Order {
    private _version: number;
    private _status: OrderStatus;
    private _items: Set<string>;
    private _totalPrice: number | undefined;

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

    /**
     * `totalPrice` is only defined if the order status is
     * `CHECKED_OUT`.
     */
    public get totalPrice(): number | undefined {
        return this._totalPrice;
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
                    this.handleOrderCheckedOut(event);
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

    private handleOrderCheckedOut(event: CheckedOutEvent) {
        this.handleStatusChange('CHECKED_OUT');
        this._totalPrice = event.payload.totalPrice;
    }

    private handleStatusChange(status: OrderStatus) {
        this._status = status;
    }
}

export type OrderStatus = 'IN_PROGRESS' | 'CHECKED_OUT' | 'CONFIRMED';
