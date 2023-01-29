import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/orders/get-orders';
import { Order } from '../domain/orders';

export const useGetOrders = () =>
    useQuery<Order[], Error>({
        queryKey: ['orders'],
        queryFn: () => getOrders(),
    });
