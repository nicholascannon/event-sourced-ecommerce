import React, { useContext, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { Loader } from '../components/loader';
import { CurrentOrderIdContext } from '../contexts/current-order-context';
import { useGetOrderById } from '../hooks/use-get-order';
import { OrderView } from '../components/order-view';
import { buildInitialOrder } from '../domain/orders';

export const CartPage = () => {
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const orderId = useContext(CurrentOrderIdContext);
    const getOrderQuery = useGetOrderById(orderId);

    // TODO: This will probably be moved into a mutation func
    const checkoutOrder = () => {
        setIsCheckingOut(true);
        setTimeout(() => setIsCheckingOut(false), 1_000);
    };

    if (getOrderQuery.error) console.error(getOrderQuery.error); // log but let user attempt checkout
    return (
        <CartPageView
            checkoutOrder={checkoutOrder}
            isCheckingOut={isCheckingOut}
            currentOrder={
                <OrderView
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
const CartPageView = ({ checkoutOrder, isCheckingOut, currentOrder }: Props) => {
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
        </>
    );
};

type Props = {
    checkoutOrder: () => void;
    isCheckingOut: boolean;
    currentOrder: JSX.Element;
};
