import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { RootLayout } from './layouts/root-layout';
import { CartPage } from './pages/cart-page';
import { ErrorPage } from './pages/error-page';
import { PreviousOrdersPage } from './pages/previous-orders-page';
import { OrderDetailsPage } from './pages/order-details-page';
import { ProductsPage } from './pages/products-page';

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
                element: <ProductsPage />,
            },
            {
                path: '/cart',
                element: <CartPage />,
            },
            {
                path: '/previous-orders',
                element: <PreviousOrdersPage />,
            },
            {
                path: '/order/:id',
                element: <OrderDetailsPage />,
            },
        ],
    },
]);
