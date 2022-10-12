# Product Service Mock

Provides a mock service for the Product Web Service which lives in the Product bounded context.

## How to update the mocked data

Just edit the data in `./src/valid-products.json`.

## What if the Product service API changes

The API is versioned (`/v1/product`).
If the Order bounded context needs to depend on a newer version in the future, then this mock should be updated to match that newer version.

## How do I run it?

You'll only need to run this from the `docker-compose.yml` file, which is already setup.
