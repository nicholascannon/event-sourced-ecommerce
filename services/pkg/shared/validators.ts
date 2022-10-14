import { AjvValidator } from './validation';

export const uuidValidator = new AjvValidator<string>({ type: 'string', format: 'uuid' });
