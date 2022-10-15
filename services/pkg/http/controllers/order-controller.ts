import { Request, Response } from 'express';
import { uuidValidator } from '../../shared/validators';
import { ProductService } from '../../integrations/product/product-service';
import { OrderService } from '../../domain/order/order-service';

export class OrderController {
    constructor(private readonly orderService: OrderService, private readonly productService: ProductService) {}

    async addItem(req: Request, res: Response): Promise<Response> {
        const orderId = uuidValidator.validate(req.params.orderId);
        const itemId = uuidValidator.validate(req.params.itemId);

        const item = await this.productService.getProduct(itemId);
        if (item === undefined) {
            return res.sendStatus(404);
        }

        const { created, duplicate, alreadyCheckedOut } = await this.orderService.addItem(orderId, item.id);
        if (alreadyCheckedOut) {
            return res.sendStatus(403);
        }
        if (duplicate) {
            return res.sendStatus(202);
        }

        return res.sendStatus(created ? 201 : 200);
    }
}
