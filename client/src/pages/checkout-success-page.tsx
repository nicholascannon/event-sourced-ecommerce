import React from 'react';
import { Box, Typography } from '@mui/material';

export const CheckoutSuccessPage = () => {
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h1" gutterBottom>
                Checkout Successful!
            </Typography>
            <Typography variant="h5">A confirmation email will arrive in your inbox shortly</Typography>
        </Box>
    );
};
