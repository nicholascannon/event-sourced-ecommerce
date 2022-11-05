import { AjvValidator } from '../shared/validation';

export interface Bookmark {
    id: string;
    insertingTxid: string;
}

export const bookmarkValidator = new AjvValidator<Bookmark>({
    type: 'object',
    properties: {
        id: { type: 'string' },
        insertingTxid: { type: 'string' },
    },
    required: ['id', 'insertingTxid'],
    additionalProperties: false,
});
