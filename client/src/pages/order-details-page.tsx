import React from 'react';
import { useParams } from 'react-router';
import { useGetOrderById } from '../hooks/use-get-order';
import { Loader } from '../components/loader';
import { Order } from '../domain/orders';
import { OrderView } from '../components/order-view';

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
            {/* error and isLoading is handled by the behavioral component above */}
            <OrderView order={order} displayDetails={true} error={null} isLoading={false} />
        </>
    );
};

type Props = {
    order: Order;
};
