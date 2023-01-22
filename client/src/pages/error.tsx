import { Box, Typography } from '@mui/material';
import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    let errorMessage = 'Unknown error';
    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: '100vh',
                gap: '20px',
            }}
        >
            <Typography variant="h3">Oops!</Typography>
            <Typography variant="h5">An error has occurred.</Typography>
            <Typography variant="body1">{errorMessage}</Typography>
        </Box>
    );
};
