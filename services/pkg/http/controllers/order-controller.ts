import { Request, Response, Router } from 'express';
import { uuidValidator } from '../../shared/validators';
import { OrderService } from '../../domain/order/order-service';
import { assertNever } from '../../shared/assert';
import { Controller } from './controller';
import { asyncHandler } from '../middleware/async-handler';

export class OrderController implements Controller {
    public readonly router: Router;

    constructor(private readonly orderService: OrderService) {
        this.router = Router();
        this.router.post(
            '/v1/orders/:orderId/add',
            asyncHandler((req, res) => this.addItem(req, res))
        );
        this.router.get(
            '/v1/orders/:orderId',
            asyncHandler((req, res) => this.getOrder(req, res))
        );
        this.router.post(
            '/v1/orders/:orderId/checkout',
            asyncHandler((req, res) => this.checkout(req, res))
        );
        this.router.get(
            '/v1/orders',
            asyncHandler((req, res) => this.getOrders(req, res))
        );
    }

    async addItem(req: Request, res: Response) {
        const orderId = uuidValidator.validate(req.params.orderId);
        const itemId = uuidValidator.validate(req.body.itemId);

        const createItemResponse = await this.orderService.addItem(orderId, itemId);
        switch (createItemResponse) {
            case 'DUPLICATE_ITEM':
                return res.sendStatus(202);
            case 'CREATED_ORDER':
                return res.sendStatus(201);
            case 'SUCCESS':
                return res.sendStatus(200);
            default:
                assertNever(createItemResponse);
        }
    }

    async getOrder(req: Request, res: Response) {
        const orderId = uuidValidator.validate(req.params.orderId);
        const order = await this.orderService.getOrder(orderId);

        if (order.items.length === 0) {
            return res.sendStatus(404);
        }

        return res.json(order);
    }

    async getOrders(_req: Request, res: Response) {
        const orders = await this.orderService.getOrders();
        return res.json(orders);
    }

    async checkout(req: Request, res: Response) {
        const orderId = uuidValidator.validate(req.params.orderId);
        await this.orderService.checkout(orderId);
        return res.sendStatus(200);
    }
}
