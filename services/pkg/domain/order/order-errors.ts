export class AlreadyCheckedOutError extends Error {
    constructor(orderId: string) {
        super(`Cannot complete action on checked out order ${orderId}`);
        this.name = this.constructor.name;
    }
}

export class InvalidOrderItemError extends Error {
    constructor(itemId: string) {
        super(`Item ${itemId} is not a valid item`);
        this.name = this.constructor.name;
    }
}

export class OrderNotFoundError extends Error {
    constructor(orderId: string) {
        super(`Order ${orderId} not found`);
        this.name = this.constructor.name;
    }
}
