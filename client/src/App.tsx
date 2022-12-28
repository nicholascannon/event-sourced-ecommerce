import React from 'react';
import { Button } from '@mui/material';
import { Page } from './components/layout/page';

export function App() {
    return (
        <>
            <Page title="Orders">
                <Button variant="contained">Click me</Button>
            </Page>
        </>
    );
}
