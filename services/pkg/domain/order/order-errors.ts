export class AlreadyCheckedOutError extends Error {
    constructor(public readonly orderId: string) {
        super('Cannot complete action on checked out order');
        this.name = this.constructor.name;
    }
}

export class InvalidOrderItemError extends Error {
    constructor(public readonly itemIds: string[]) {
        super('Invalid order item');
        this.name = this.constructor.name;
    }
}

export class OrderDoesNotExist extends Error {
    constructor(public readonly orderId: string) {
        super('Cannot complete action on unknown order');
        this.name = this.constructor.name;
    }
}
