import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './data/query-client';
import { CurrentOrderIdContext, getOrInitialiseOrderId } from './data/contexts/current-order-context';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <CurrentOrderIdContext.Provider value={getOrInitialiseOrderId()}>
                    <RouterProvider router={router} />
                </CurrentOrderIdContext.Provider>
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>
);
