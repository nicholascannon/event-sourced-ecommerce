import React from 'react';
import { Loader } from '../components/loader';
import { Product } from '../domain/product';
import { useGetProducts } from '../data/queries/use-get-products';
import { ProductComponent } from '../components/product-component';

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
                <ProductComponent key={product.id} product={product} />
            ))}
        </>
    );
};

type Props = {
    products: Product[];
};
