import React, { useState } from 'react';
import { Box, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AppBar } from '../components/generic/app-bar';
import { Container } from '@mui/system';
import { Nav } from '../components/nav';

export function RootLayout({ children }: Props) {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ pr: '24px' }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: '36px',
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" component="div">
                        Event Sourced Ecommerce
                    </Typography>
                </Toolbar>
            </AppBar>

            <Nav open={open} toggle={toggleDrawer} />

            <Box
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',

                    display: 'flex',
                    flexDirection: 'column',
                }}
                component="main"
            >
                <Toolbar />
                <Container sx={{ mt: 4, mb: 4, flex: 1 }}>{children}</Container>
            </Box>
        </Box>
    );
}

type Props = {
    children: React.ReactNode;
};
