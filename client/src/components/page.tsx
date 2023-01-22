import React, { useState } from 'react';
import { Box, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AppBar } from './generic/app-bar';
import { Container } from '@mui/system';
import { Nav } from './nav';

export function Page(props: Props) {
    const { title, children } = props;

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
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Nav open={open} toggle={toggleDrawer} />

            <Box
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
                component="main"
            >
                <Toolbar />
                <Container sx={{ mt: 4, mb: 4 }}>{children}</Container>
            </Box>
        </Box>
    );
}

type Props = {
    title: string;
    children: React.ReactNode;
};
