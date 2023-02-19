import React, { useContext } from 'react';
import { Button, Typography } from '@mui/material';
import { Loader } from '../components/loader';
import { CurrentOrderIdContext } from '../data/contexts/current-order-context';
import { useGetOrderById } from '../data/queries/use-get-order';
import { OrderComponent } from '../components/order-component';
import { buildInitialOrder } from '../domain/orders';
import { useCheckoutOrderMutation } from '../data/mutations/checkout-order';

export const CartPage = () => {
    const orderId = useContext(CurrentOrderIdContext);
    const getOrderQuery = useGetOrderById(orderId);
    const mutation = useCheckoutOrderMutation();

    if (getOrderQuery.error) console.error(getOrderQuery.error); // log but let user attempt checkout
    if (mutation.isSuccess) {
        // TODO: redirect to static success page, clear the order ID from local storage and context
        return <Typography variant="body1">Checkout Success!</Typography>;
    }

    return (
        <CartPageView
            checkoutOrder={() => mutation.mutate(orderId)}
            isCheckingOut={mutation.isLoading}
            checkoutError={mutation.isError}
            currentOrder={
                <OrderComponent
                    error={getOrderQuery.error}
                    isLoading={getOrderQuery.isLoading}
                    order={getOrderQuery.data || buildInitialOrder(orderId)}
                    displayDetails={false}
                />
            }
        />
    );
};

// TODO: make this more pretty
const CartPageView = ({ checkoutOrder, isCheckingOut, currentOrder, checkoutError }: Props) => {
    return (
        <>
            <Typography variant="h4" gutterBottom>
                Cart
            </Typography>

            {currentOrder}

            {!isCheckingOut && (
                <Button variant="outlined" onClick={checkoutOrder}>
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
};
