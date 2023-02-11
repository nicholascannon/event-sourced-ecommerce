import React from 'react';
import { v4 as uuid } from 'uuid';

export const CurrentOrderIdContext = React.createContext<string>('');

/**
 * TODO: clean this up:
 *  - Move it?
 *  - Session storage instead??
 */
export const getOrInitialiseOrderId = () => {
    let orderId = localStorage.getItem(ORDER_ID_KEY);
    if (orderId === null) {
        orderId = uuid();
        localStorage.setItem(ORDER_ID_KEY, orderId);
    }

    return orderId;
};

const ORDER_ID_KEY = 'orderId';
