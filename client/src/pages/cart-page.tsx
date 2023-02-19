import React, { useContext } from 'react';
import { Button, Typography } from '@mui/material';
import { Loader } from '../components/loader';
import { CurrentOrderIdContext } from '../data/contexts/current-order-context';
import { useGetOrderById } from '../data/queries/use-get-order';
import { OrderComponent } from '../components/order-component';
import { buildInitialOrder } from '../domain/orders';
import { useCheckoutOrderMutation } from '../data/mutations/checkout-order';
import { Navigate } from 'react-router-dom';

export const CartPage = () => {
    const orderId = useContext(CurrentOrderIdContext);
    const getOrderQuery = useGetOrderById(orderId);
    const mutation = useCheckoutOrderMutation();

    // we still want to display an init order if it was a 404 error
    const orderWasNotFoundError = Boolean(getOrderQuery.error?.message.includes('Order not found'));

    if (getOrderQuery.error && !orderWasNotFoundError) console.error(getOrderQuery.error); // log but let user attempt checkout
    if (mutation.isSuccess) {
        // TODO: clear the order ID from local storage and context
        return <Navigate to="/checkout-success" />;
    }

    return (
        <CartPageView
            checkoutOrder={() => mutation.mutate(orderId)}
            isCheckingOut={mutation.isLoading}
            checkoutError={mutation.isError}
            disableCheckout={orderWasNotFoundError}
            currentOrder={
                <OrderComponent
                    isError={getOrderQuery.isError && !orderWasNotFoundError}
                    isLoading={getOrderQuery.isLoading}
                    order={getOrderQuery.data || buildInitialOrder(orderId)}
                    displayDetails={false}
                />
            }
        />
    );
};

// TODO: make this more pretty
const CartPageView = ({ checkoutOrder, isCheckingOut, currentOrder, checkoutError, disableCheckout }: Props) => {
    return (
        <>
            <Typography variant="h4" gutterBottom>
                Cart
            </Typography>

            {currentOrder}

            {!isCheckingOut && (
                <Button variant="outlined" onClick={checkoutOrder} disabled={disableCheckout}>
                    Checkout
                </Button>
            )}
            {isCheckingOut && <Loader />}
            {checkoutError && <Typography variant="body1">There was an error checking out your order</Typography>}
        </>
    );
};

type Props = {
    checkoutOrder: () => void;
    isCheckingOut: boolean;
    checkoutError: boolean;
    currentOrder: JSX.Element;
    disableCheckout: boolean;
};
