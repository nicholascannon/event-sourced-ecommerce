# Event Sourced Ecommerce System

An event sourced ecommerce system for learning and development.

![System design overview](./docs/diagrams/system-design.png)

## Project Goals

-   Create an order
-   Add an item to order
-   Checkout an order
-   View order

## Out of Scope

I have made the following out of scope for this project to keep things simple:

-   Adding more than 1 item to an order (quantities)
-   Removing items from order
-   Actually sending emails (instead use a mock)
-   Any product bounded context stuff e.g. product service (again use a mock)
-   API authentication
-   User specific stuff e.g. orders won't have a customer id attached
