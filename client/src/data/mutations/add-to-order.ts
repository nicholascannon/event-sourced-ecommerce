import { useMutation } from '@tanstack/react-query';
import { addToOrder } from '../../api/orders/add-to-order';

export const useAddToOrderMutation = (orderId: string) => {
    return useMutation((itemId: string) => addToOrder(orderId, itemId));
};
