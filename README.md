# Event Sourced Ecommerce System

An event sourced ecommerce system for learning and development.

**STACK: TypeScript, Node.js, Postgres, Docker, ESBuild, Flyway.**

## Project Context

Create a system that allows clients to add items to an order, view the order and then checkout, emailing them with a confirmation email.
The business requires orders not yet checked out to be persisted server-side so clients can continue orders on different devices.
Checked out orders can not have new items added.

The business is very data driven and therefore require that we track the lifecycle of orders from first item added to checkout.

I have made the following **out of scope** to keep things simple:

-   Item quantities and removing items
-   Sending emails (use a mock)
-   Product service (use a mock)
-   Authentication & authorization
-   Handling concurrency issues with product price changes

## Services Overview

![System design overview](./docs/diagrams/system-design.png)

-   **Order Service**: A web API responsible for creating, adding items to, viewing and checking out orders.
-   **Checkout Process Manager**: A process manager responsible for executing the checkout flow when orders are checked out.
-   **Order Read Model Populator**: A read model populator that populates a projection of an Order for query purposes (used by the API).

## How to run locally

Run everything in Docker:

```sh
./scripts/run.sh
```

Or run locally with hot reload:

```sh
./scripts/develop.sh
cd services
npm run watch:<SERVICE_NAME>
```

Each service has a `watch` command defined in the `package.json`.
Run each of these watch commands in a different terminal to get hot reloading.

## Project Structure

```sh
docs/               # Documentation and diagrams
    ...
mocks/              # Mocked services (e.g. product bounded context)
    ...
postman/            # Postman collections
    ...
services/           # Backend services code
    package.json
    pkg/            # Code shared between all backend services
    order-service/  # Entrypoint for the order service
        main.ts
        config.ts
        Dockerfile
        ...
    checkout-pm/    # Entrypoint for the checkout process manager
        main.ts
        config.ts
        Dockerfile
        ...
    ...
README.md           # File you're reading now
```

## Further Reading

-   [Order events overview](./docs/events.md)
-   [Product service mock](./mocks/product-service/README.md)

## Quick links

Not familiar with the structure of this project?
Here's some quick links to jump to the interesting stuff:

-   [Order service express app](./services/order-service/app.ts) (a good starting point)
-   [Order service](./services/pkg/domain/order/order-service.ts)
-   [Order HTTP controller](./services/pkg/http/controllers/order-controller.ts)
-   [Order domain code](./services/pkg/domain/order)
-   [Postgres eventstore](./services/pkg/data/postgres/pg-event-store.ts)
