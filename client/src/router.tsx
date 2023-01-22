import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { RootLayout } from './layouts/root-layout';
import { ErrorPage } from './pages/error';
import { MyOrdersPage } from './pages/my-orders';

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
        ],
    },
]);
