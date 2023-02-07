import express from 'express';
import morgan from 'morgan';
import { lifecycle } from './lifecycle';
import validProducts from './valid-products.json';

const app = express();
app.use(morgan('dev'));

app.get('/v1/product/:id', (req, res) => {
    const { id } = req.params;

    const product = validProducts.products.find((product) => product.id === id);
    if (product === undefined) {
        return res.sendStatus(404);
    }
    return res.status(200).json({ name: product.name, price: product.price });
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
    lifecycle.on('close', () => server.close());
});
