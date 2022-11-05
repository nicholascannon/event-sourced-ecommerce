import { Logger } from 'winston';
import { EmailServiceIntegration, EmailTemplate } from './email-integration';

export class MemoryEmailServiceIntegration implements EmailServiceIntegration {
    constructor(private readonly logger: Logger) {}

    async sendEmail(template: EmailTemplate) {
        this.logger.info('Email sent!', { email: template });
    }
}
