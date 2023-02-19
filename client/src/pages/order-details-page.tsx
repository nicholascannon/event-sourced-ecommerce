import React from 'react';
import { useParams } from 'react-router';
import { useGetOrderById } from '../data/queries/use-get-order';
import { Loader } from '../components/loader';
import { Order } from '../domain/orders';
import { OrderComponent } from '../components/order-component';

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
            <OrderComponent order={order} displayDetails={true} />
        </>
    );
};

type Props = {
    order: Order;
};
