import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../api/orders/get-order';
import { Order } from '../domain/orders';

export const useGetOrderById = (orderId: string) =>
    useQuery<Order, Error>({
        queryKey: ['order', orderId],
        queryFn: () => getOrderById(orderId),
    });
