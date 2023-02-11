import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { RootLayout } from './layouts/root-layout';
import { YourOrderPage } from './pages/your-order-page';
import { ErrorPage } from './pages/error-page';
import { MyOrdersPage } from './pages/my-orders-page';
import { OrderDetailsPage } from './pages/order-details-page';

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
                path: '/order',
                element: <YourOrderPage />,
            },
            {
                path: '/order/:id',
                element: <OrderDetailsPage />,
            },
        ],
    },
]);
