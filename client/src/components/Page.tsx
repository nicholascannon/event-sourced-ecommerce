import React from 'react';
import {
    AppBar,
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';

export function Page(props: Props) {
    const { title } = props;

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{ width: { sm: `calc(100% - ${DRAW_WIDTH}px)` }, ml: { sm: `${DRAW_WIDTH}px` } }}
            >
                <Toolbar>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: DRAW_WIDTH }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAW_WIDTH },
                    }}
                    open
                >
                    <Toolbar />
                    <Divider />
                    <List>
                        <ListItem>
                            <ListItemButton>
                                <ListItemText primary="My Orders" />
                            </ListItemButton>
                        </ListItem>

                        <ListItem>
                            <ListItemButton>
                                <ListItemText primary="Create Order" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Drawer>
            </Box>

            <Box sx={{ width: { sm: `calc(100% - ${DRAW_WIDTH}px)` }, flexGrow: 1, p: 3 }} component="main">
                <Toolbar />
                {props.children}
                <Typography paragraph>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Rhoncus dolor purus non enim praesent elementum facilisis leo vel. Risus at
                    ultrices mi tempus imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus. Convallis
                    convallis tellus id interdum velit laoreet id donec ultrices. Odio morbi quis commodo odio aenean
                    sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies integer quis. Cursus euismod
                    quis viverra nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Mauris
                    commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat vivamus at augue. At augue
                    eget arcu dictum varius duis at consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem
                    donec massa sapien faucibus et molestie ac.
                </Typography>
            </Box>
        </Box>
    );
}

type Props = {
    title: string;
    children: React.ReactNode;
};

const DRAW_WIDTH = 300; // px
