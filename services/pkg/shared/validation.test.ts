import { AjvValidator, ValidationError } from './validation';

describe('AjvValidator', () => {
    it('should throw a ValidationError when the value does not match the schema', () => {
        const validator = new AjvValidator<number>({ type: 'number' });
        expect(() => validator.validate('hello, world')).toThrowError(ValidationError);
    });

    it('should return the same value after calling validate when validation is successful', () => {
        const validator = new AjvValidator<number>({ type: 'number' });
        const value = 5;
        expect(validator.validate(value)).toBe(value);
    });
});
