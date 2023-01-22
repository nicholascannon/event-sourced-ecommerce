import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { CreateOrder } from './pages/create-order';
import { MyOrders } from './pages/my-orders';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MyOrders />,
    },
    {
        path: '/orders/new',
        element: <CreateOrder />,
    },
]);
