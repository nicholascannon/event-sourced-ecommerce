import { useMutation } from '@tanstack/react-query';
import { checkoutOrder } from '../../api/orders/checkout-order';

export const useCheckoutOrderMutation = () => useMutation((orderId: string) => checkoutOrder(orderId));
