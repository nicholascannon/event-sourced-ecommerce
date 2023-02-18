import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Loader } from '../components/loader';
import { Product } from '../domain/product';
import { useGetProducts } from '../hooks/use-get-products';

export const ProductPage = () => {
    const { data: products, error, isLoading } = useGetProducts();

    if (isLoading) return <Loader />;
    if (error) throw error;
    return <ProductPageView products={products} />;
};

export const ProductPageView = ({ products }: Props) => {
    return (
        <>
            <Typography variant="h4" gutterBottom>
                Our Products
            </Typography>

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
