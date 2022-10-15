import fetch, { FetchError } from 'node-fetch';
import { IntegrationError } from '../integration-errors';
import type { GetProductResponse } from './product-responses';

export class HttpProductService implements ProductService {
    constructor(private readonly productServiceHost: string) {}

    async getProduct(productId: string): Promise<Product | undefined> {
        try {
            const response = await fetch(`${this.productServiceHost}/product/${productId}`);
            if (response.status !== 200) {
                if (response.status === 404) {
                    return undefined;
                }

                throw new IntegrationError('Product', {
                    status: response.status,
                    statusText: response.statusText,
                    endpoint: '/product/:id',
                    message: 'Unknown integration response',
                });
            }

            const { name, price } = (await response.json()) as GetProductResponse;
            return { id: productId, name, price };
        } catch (error) {
            if (error instanceof FetchError) {
                throw new IntegrationError('Product', {
                    message: error.message,
                    type: error.type,
                    endpoint: '/product/:id',
                });
            }

            throw error;
        }
    }
}

export interface ProductService {
    getProduct: (productId: string) => Promise<Product | undefined>;
}

interface Product {
    id: string;
    name: string;
    price: number;
}
