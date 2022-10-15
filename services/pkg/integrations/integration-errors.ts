export class IntegrationError extends Error {
    constructor(integration: string, public readonly metadata?: Record<string, unknown>) {
        super(`${integration} integration error`);
        this.name = this.constructor.name;
    }
}
