import React from 'react';
import { Typography } from '@mui/material';
import { Order } from '../domain/orders';
import { useGetOrders } from '../data/queries/use-get-orders';
import { Loader } from '../components/loader';

export const PreviousOrdersPage = () => {
    const { data, error, isLoading } = useGetOrders();

    if (isLoading) return <Loader />;
    if (error) throw error;
    return <PreviousOrdersPageView orders={data} />;
};

// TODO: make this prettier...
const PreviousOrdersPageView = ({ orders }: ViewProps) => {
    return (
        <>
            <Typography variant="h4" gutterBottom>
                Your Previous Orders
            </Typography>

            {orders.map((order) => (
                <Typography key={order.id} variant="body1">
                    {order.id}
                </Typography>
            ))}

            {orders.length === 0 && <Typography variant="body1">You have no previous orders</Typography>}
        </>
    );
};

type ViewProps = {
    orders: Order[];
};
