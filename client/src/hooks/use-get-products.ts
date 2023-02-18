import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/product/get-products';
import { Product } from '../domain/product';

export const useGetProducts = () =>
    useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: () => getProducts(),
    });
