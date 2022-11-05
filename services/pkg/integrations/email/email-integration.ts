export interface EmailServiceIntegration {
    sendEmail: (template: EmailTemplate) => Promise<void>;
}

export type EmailTemplate = CheckoutEmailTemplate | WelcomeEmailTemplate;

interface CheckoutEmailTemplate {
    template: 'CHECKOUT';
    payload: {
        orderId: string;
        totalPrice: number;
        items: { name: string }[];
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
