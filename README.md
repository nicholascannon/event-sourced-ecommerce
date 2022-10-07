# Event Sourced Ecommerce System

An event sourced ecommerce system for learning and development.

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

## Services Overview

-   **Order Service**: A web API responsible for creating, adding items to, viewing and checking out orders.
-   **Order UI**: A React frontend application for the order service, allows users to interact with the system.
-   **Order Read Model Populator**: A process manager that listens to order update events and builds the order read model used for querying orders.
-   **Checkout Process Manager**: A process manager responsible for executing the checkout flow when orders are checked out.

![System design overview](./docs/diagrams/system-design.png)

## Project Structure

```sh
client/             # The React Order UI
    package.json
    ...
docs/               # Documentation and diagrams
    ...
services/           # Backend services code
    package.json
    pkg/            # Code shared between all backend services
    order-service/  # Entrypoint for the order service
        main.ts
        config.ts
        ...
    order-rmp/      # Entrypoint for the order read model populator
        main.ts
        config.ts
        ...
    checkout-pm/    # Entrypoint for the checkout process manager
        main.ts
        config.ts
        ...
    ...
README.md           # File you're reading now
```
