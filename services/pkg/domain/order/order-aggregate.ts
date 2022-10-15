import { AddItemEvent, OrderEvent } from './order-events';

/**
 * This aggregate is used to execute commands against orders. It should
 * only be used as a 'Write Model', not for executing queries.
 */
export class OrderAggregate {
    private readonly items: Set<string>;
    private version: number;

    constructor(public readonly id: string) {
        this.items = new Set();
        this.version = 0;
    }

    hydrateState(events: OrderEvent[]) {
        events.forEach((event) => {
            if (event.eventType === 'ORDER_ITEM_ADDED') {
                this.addItem(event);
            }

            this.version += 1;
        });
    }

    private addItem(event: AddItemEvent) {
        this.items.add(event.payload.itemId);
    }

    hasItem(itemId: string): boolean {
        return this.items.has(itemId);
    }

    getVersion(): number {
        return this.version;
    }
}
