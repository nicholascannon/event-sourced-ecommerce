export class AlreadyCheckedOutError extends Error {
    constructor(public readonly orderId: string) {
        super(`Cannot complete action on checked out order ${orderId}`);
        this.name = this.constructor.name;
    }
}

export class InvalidOrderItemError extends Error {
    constructor(public readonly itemIds: string[]) {
        super(`Invalid items in order: ${itemIds.join(', ')}`);
        this.name = this.constructor.name;
    }
}

export class OrderDoesNotExist extends Error {
    constructor(public readonly orderId: string) {
        super(`Cannot complete action on unknown order ${orderId}`);
        this.name = this.constructor.name;
    }
}
