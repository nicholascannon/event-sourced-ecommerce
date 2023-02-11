import React from 'react';
import { Typography } from '@mui/material';
import { useParams } from 'react-router';
import { useGetOrderById } from '../hooks/use-get-order';
import { Loader } from '../components/loader';
import { Order } from '../domain/orders';

export const OrderDetailsPage = () => {
    const params = useParams();
    const { data: order, error, isLoading } = useGetOrderById(params.id as string);

    if (isLoading) return <Loader />;
    if (error) throw error;
    if (order === undefined) throw new Error(`Order not found (${params.id})`);
    return <OrderDetailsView order={order} />;
};

// TODO: make this waaaay prettier
const OrderDetailsView = ({ order }: Props) => {
    return (
        <>
            <Typography variant="h4" gutterBottom>
                Order #{order.id}
            </Typography>
            <Typography variant="body1">Status: {order.status}</Typography>
            <br />
            <Typography variant="body1">Items:</Typography>
            {order.items.map((item) => (
                <Typography variant="body1">
                    {item.id} - {item.name}
                </Typography>
            ))}
        </>
    );
};

type Props = {
    order: Order;
};
