import React from 'react';
import { Typography } from '@mui/material';
import { Loader } from './loader';
import { Order } from '../domain/orders';

export const OrderComponent = ({ isError: error, isLoading, order, displayDetails = true }: Props) => {
    if (isLoading) return <Loader />;
    if (error) return <Typography variant="body1">There was an error loading your order.</Typography>;

    return (
        <>
            {displayDetails && (
                <>
                    <Typography variant="h4" gutterBottom>
                        Order #{order.id}
                    </Typography>
                    <Typography variant="body1">Status: {order.status}</Typography>
                    <br />
                </>
            )}

            <Typography variant="body1">Items:</Typography>
            {/* TODO: change this to a table component */}
            {order.items.map((item) => (
                <Typography variant="body1">
                    {item.id} - {item.name}
                </Typography>
            ))}

            {/* TODO: display prices + date etc. */}
        </>
    );
};

type Props = {
    order: Order;
    isError?: boolean;
    isLoading?: boolean;
    displayDetails?: boolean;
};
