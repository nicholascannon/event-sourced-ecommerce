import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import ajvFormats from 'ajv-formats';

export class AjvValidator<T> implements Validator<T> {
    private static AJV = ajvFormats(new Ajv({ allErrors: true }));

    private isValid: ValidateFunction<T>;

    constructor(schema: JSONSchemaType<T>) {
        this.isValid = AjvValidator.AJV.compile(schema);
    }

    /**
     * Validates the object against the schema, throws a ValidationError
     * if not valid.
     */
    validate(object: unknown): T {
        if (this.isValid(object)) {
            return object;
        }

        const errors = this.isValid.errors;
        if (errors && errors.length > 0) {
            throw new ValidationError(AjvValidator.AJV.errorsText(errors));
        }

        throw new ValidationError('Object validation failed with no error messages');
    }
}

export interface Validator<T> {
    validate: (object: unknown) => T;
}

export class ValidationError extends Error {
    constructor(public errors: string) {
        super('Object validation failed');
        this.name = this.constructor.name;
    }
}
