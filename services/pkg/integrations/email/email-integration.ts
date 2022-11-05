import { Order } from '../../domain/order/order';

export interface EmailServiceIntegration {
    sendEmail: (template: EmailTemplate) => Promise<void>;
}

export type EmailTemplate = CheckoutEmailTemplate | WelcomeEmailTemplate;

interface CheckoutEmailTemplate {
    template: 'CHECKOUT';
    payload: {
        order: Order;
    };
}

// note: this is just here for example - it's unused
interface WelcomeEmailTemplate {
    template: 'WELCOME';
    payload: {
        firstname: string;
        lastname: string;
    };
}
