import React from 'react';
import { Divider, IconButton, List, Toolbar } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, Home as HomeIcon, Add as AddIcon } from '@mui/icons-material';
import { Drawer } from './drawer';
import { NavLink } from './nav-link';

export function Nav({ open, toggle }: Props) {
    return (
        <Drawer variant="permanent" open={open}>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                <IconButton onClick={toggle}>
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>

            <Divider />

            <List component="nav">
                <NavLink to="/" icon={<HomeIcon />} text="My Orders" />
                <NavLink to="/create-order" icon={<AddIcon />} text="Create Order" />
            </List>
        </Drawer>
    );
}

type Props = {
    open: boolean;
    toggle: () => void;
};
