import { BaseEvent } from '../events';

interface BaseOrderEvent extends BaseEvent {
    streamType: 'ORDER_FLOW';
}

export interface AddItemEvent extends BaseOrderEvent {
    eventType: 'ORDER_ITEM_ADDED';
    payload: {
        itemId: string;
        price: number;
    };
}
