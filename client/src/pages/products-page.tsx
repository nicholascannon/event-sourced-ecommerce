import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Loader } from '../components/loader';
import { Product } from '../domain/product';
import { useGetProducts } from '../hooks/use-get-products';

export const ProductsPage = () => {
    const { data: products, error, isLoading } = useGetProducts();

    if (isLoading) return <Loader />;
    if (error) throw error;
    return <ProductsPageView products={products} />;
};

export const ProductsPageView = ({ products }: Props) => {
    return (
        <>
            {products.map((product) => (
                <Box key={product.id}>
                    <Typography variant="body1">{product.name}</Typography>
                    <Button variant="outlined">Add to order</Button>
                </Box>
            ))}
        </>
    );
};

type Props = {
    products: Product[];
};
