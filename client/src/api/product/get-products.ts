import { CONFIG } from '../../config';
import { Product } from '../../domain/product';

// NOTE: should be paginated but out of scope
export const getProducts = async (): Promise<Product[]> => {
    const res = await fetch(`${CONFIG.productServiceURL}/v1/product`);
    if (!res.ok) {
        throw new Error(`Failed to fetch products (${res.status} ${res.statusText})`);
    }

    const payload = await res.json();
    return payload.products;
};
