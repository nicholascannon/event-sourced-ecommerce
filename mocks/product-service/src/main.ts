import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { lifecycle } from './lifecycle';
import validProducts from './valid-products.json';

const app = express();
app.use(morgan('dev'));
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    })
);

app.get('/v1/product/:id', (req, res) => {
    const { id } = req.params;

    const product = validProducts.products.find((product) => product.id === id);
    if (product === undefined) {
        return res.sendStatus(404);
    }
    return res.status(200).json({ name: product.name, price: product.price });
});

app.get('/v1/product', (_req, res) => {
    return res.json(validProducts);
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
    lifecycle.on('close', () => server.close());
});
