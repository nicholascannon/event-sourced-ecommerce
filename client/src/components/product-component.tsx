import React, { useContext } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CurrentOrderIdContext } from '../data/contexts/current-order-context';
import { useAddToOrderMutation } from '../data/mutations/add-to-order';
import { Product } from '../domain/product';
import { Loader } from './loader';

export const ProductComponent = ({ product }: Props) => {
    const orderId = useContext(CurrentOrderIdContext);
    const mutation = useAddToOrderMutation(orderId);

    return (
        <ProductComponentView
            product={product}
            addToOrder={mutation.mutate}
            isLoading={mutation.isLoading}
            isError={mutation.isError}
            isSuccess={mutation.isSuccess}
        />
    );
};

type Props = {
    product: Product;
};

const ProductComponentView = ({ product, addToOrder, isError, isLoading, isSuccess }: ProductComponentViewProps) => {
    const displayAddButton = !isError && !isLoading && !isSuccess;

    return (
        <Box key={product.id}>
            <Typography variant="body1">{product.name}</Typography>

            {displayAddButton && (
                <Button variant="outlined" onClick={() => addToOrder(product.id)}>
                    Add to order
                </Button>
            )}
            {isLoading && <Loader />}
            {isSuccess && <Typography variant="caption">Added to order!</Typography>}
            {isError && <Typography variant="caption">Sorry we couldn't add this to your order</Typography>}
        </Box>
    );
};

type ProductComponentViewProps = {
    product: Product;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    addToOrder: (id: string) => void;
};
