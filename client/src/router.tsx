import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { RootLayout } from './layouts/root-layout';
import { CreateOrderPage } from './pages/create-order';
import { ErrorPage } from './pages/error';
import { MyOrdersPage } from './pages/my-orders';
import { OrderDetailsPage } from './pages/order-details';

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <RootLayout>
                <Outlet />
            </RootLayout>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <MyOrdersPage />,
            },
            {
                path: '/create-order',
                element: <CreateOrderPage />,
            },
            {
                path: '/orders/:id',
                element: <OrderDetailsPage />,
            },
        ],
    },
]);
