import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { TField } from '../../schemas';

@Injectable()
export class FieldValidatorService {
    hasRequiredValidator(formControl: FormControl) {
        return formControl.hasValidator(Validators.required);
    }

    getErrorMessages(field: TField, formControl: FormControl) {
        const errors = formControl.errors;

        if (errors === null) return;

        const errorMessages: string[] = [];

        Object.keys(errors).forEach((key) => {
            const errorMessage = this.getErrorMessageByErrorKey(key, field, formControl);

            if (errorMessage !== null && errorMessage !== undefined) {
                errorMessages.push(errorMessage);
            }
        });

        return errorMessages;
    }

    getErrorMessageByErrorKey(key: string, field: TField, formControl: FormControl) {
        switch (key) {
            case 'required':
                return this.getRequiredErrorMessage(field);

            case 'pattern':
                return this.getPatternErrorMessage(field, formControl);

            case 'min':
                return this.getMinErrorMessage(field, formControl);

            default:
                return null;
        }
    }

    getRequiredErrorMessage(field: TField) {
        if (field.readonly) return;

        const validator = field.validators?.find((validator) => validator.type === 'REQUIRED');

        return validator?.message;
    }

    getPatternErrorMessage(field: TField, formControl: FormControl) {
        if (field.readonly) return;

        const patternFromValidator = formControl.errors?.['pattern']?.requiredPattern;

        const validator = field.validators?.find(
            (validator) => validator.type === 'PATTERN' && validator.value === patternFromValidator,
        );

        return validator?.message;
    }

    getMinErrorMessage(field: TField, formControl: FormControl) {
        if (field.readonly) return;

        const minFromValidator = formControl.errors?.['min']?.min;

        const validator = field.validators?.find(
            (validator) => validator.type === 'MIN' && validator.value === minFromValidator,
        );

        return validator?.message;
    }
}
