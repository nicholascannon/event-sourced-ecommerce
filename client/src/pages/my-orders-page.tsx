import React from 'react';
import { Typography } from '@mui/material';
import { Order } from '../domain/orders';
import { useGetOrders } from '../hooks/use-get-orders';
import { Loader } from '../components/loader';

export const MyOrdersPage = () => {
    const { data, error, isLoading } = useGetOrders();

    if (isLoading) return <Loader />;
    if (error) throw error;
    return <MyOrdersView orders={data} />;
};

// TODO: make this prettier...
const MyOrdersView = ({ orders }: ViewProps) => {
    return (
        <>
            <Typography variant="h4" gutterBottom>
                My Orders
            </Typography>
            {orders.length ? orders.map((order) => <p>{order.id}</p>) : <p>No orders</p>}
        </>
    );
};

type ViewProps = {
    orders: Order[];
};
