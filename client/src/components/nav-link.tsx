import React from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from './link';

export function NavLink({ to, text, icon }: Props) {
    return (
        <Link to={to} decoration={false}>
            <ListItemButton>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </Link>
    );
}

type Props = {
    to: string;
    text: string;
    icon: React.ReactElement;
};
