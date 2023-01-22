import React from 'react';
import { Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, Home as HomeIcon, Add as AddIcon } from '@mui/icons-material';
import { Drawer } from './generic/drawer';

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
                <ListItemButton>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Orders" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Create Order" />
                </ListItemButton>
            </List>
        </Drawer>
    );
}

type Props = {
    open: boolean;
    toggle: () => void;
};
