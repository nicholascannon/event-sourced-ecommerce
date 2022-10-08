# Events

status: **DRAFT**

This document outlines all the events written in this system.

## The Order Base Event

```jsonc
{
    "streamId": "<ORDER_UUID>",
    "streamType": "ORDER",
    "version": 1,
    "eventType": "<EVENT_TYPE>",
    "payload": {...}
}
```

All order events will have a `streamType` of `ORDER`.

The stream ID will be the unique order UUID for the order.
This will ensure streams are short lived and don't contain too many events.

The version field is a simple incrementing counter that acts as an optimistic concurrency control and also ensures proper ordering of events.

## Item Added Event Payload

```jsonc
{
    ...
    "eventType": "ORDER_ITEM_ADDED",
    "payload": {
        "itemId": "<ITEM_UUID>",
        "price": 25.00,
    },
}
```

Adds item at the current price to the order.

## Order Checked Out Event Payload

```jsonc
{
    ...
    "eventType": "ORDER_CHECKED_OUT",
    "payload": {
        /* Empty payload */
    },
}
```

Marks an order as checked out.
After this event, any `ORDER_ITEM_ADDED` events will fail.

## Order Confirmed Event Payload

```jsonc
{
    ...
    "eventType": "ORDER_CONFIRMED",
    "payload": {
        /* Empty payload */
    },
}
```

Marks an order as confirmed.
This event signals the completion of the checkout flow.

## Order Event Flow

![Order Event Flow](./diagrams/order-event-flow.png)
