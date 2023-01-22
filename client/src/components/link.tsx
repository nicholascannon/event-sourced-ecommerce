import React from 'react';
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const Link = ({ to, children, decoration }: Props) => {
    return (
        <MuiLink
            component={RouterLink}
            to={to}
            underline={decoration ? 'always' : 'none'}
            color={decoration ? 'primary' : 'inherit'}
        >
            {children}
        </MuiLink>
    );
};

type Props = {
    children: React.ReactNode;
    to: string;
    decoration?: boolean;
};
