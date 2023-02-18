import React from 'react';
import { Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    Home as HomeIcon,
    Add as AddIcon,
    ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { Drawer } from './drawer';
import { Link } from './link';

export const Nav = ({ open, toggle }: Props) => {
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
                <NavLink to="/products" icon={<ShoppingBagIcon />} text="Products" />
            </List>
        </Drawer>
    );
};

type Props = {
    open: boolean;
    toggle: () => void;
};

const NavLink = ({ to, text, icon }: NavLinkProps) => {
    return (
        <Link to={to} decoration={false}>
            <ListItemButton>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </Link>
    );
};

type NavLinkProps = {
    to: string;
    text: string;
    icon: React.ReactElement;
};
