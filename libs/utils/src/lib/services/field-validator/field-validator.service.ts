import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TField, TFieldReadAndWrite, TId, TValidator } from '../../schemas';

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

    #getFieldFormRef(form: FormGroup, fieldId: TId, subsectionId: TId, sectionId: TId) {
        return form?.get(`${sectionId}`)?.get(`${subsectionId}`)?.get(`${fieldId}`) as FormControl;
    }

    updateRequiredValidator(fieldId: TId, subsectionId: TId, sectionId: TId, form: FormGroup, remove = false) {
        const formControl = this.#getFieldFormRef(form, fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.required);
        } else {
            formControl.removeValidators(Validators.required);
        }
    }

    updatePatternValidator(
        value: string | RegExp,
        fieldId: TId,
        subsectionId: TId,
        sectionId: TId,
        form: FormGroup,
        remove = false,
    ) {
        const formControl = this.#getFieldFormRef(form, fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.pattern(value));
        } else {
            formControl.removeValidators(Validators.pattern(value));
        }
    }

    updateMaxValidator(
        value: number,
        fieldId: TId,
        subsectionId: TId,
        sectionId: TId,
        form: FormGroup,
        remove = false,
    ) {
        const formControl = this.#getFieldFormRef(form, fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.max(value));
        } else {
            formControl.removeValidators(Validators.max(value));
        }
    }

    updateMinValidator(
        value: number,
        fieldId: TId,
        subsectionId: TId,
        sectionId: TId,
        form: FormGroup,
        remove = false,
    ) {
        const formControl = this.#getFieldFormRef(form, fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.min(value));
        } else {
            formControl.removeValidators(Validators.min(value));
        }
    }

    updateMaxLengthValidator(
        value: number,
        fieldId: TId,
        subsectionId: TId,
        sectionId: TId,
        form: FormGroup,
        remove = false,
    ) {
        const formControl = this.#getFieldFormRef(form, fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.maxLength(value));
        } else {
            formControl.removeValidators(Validators.maxLength(value));
        }
    }

    updateMinLengthValidator(
        value: number,
        fieldId: TId,
        subsectionId: TId,
        sectionId: TId,
        form: FormGroup,
        remove = false,
    ) {
        const formControl = this.#getFieldFormRef(form, fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.minLength(value));
        } else {
            formControl.removeValidators(Validators.minLength(value));
        }
    }

    handleCurrentValidators(
        field: TFieldReadAndWrite,
        form: FormGroup | null,
        shouldAddFieldValidatorCb: (validator: TValidator, field: TField) => unknown,
    ) {
        if (field.readonly) return;

        if (!form) return;

        const validators = field?.validators ?? [];

        validators.forEach((validator) => {
            const shouldAddValidator = shouldAddFieldValidatorCb(validator, field);

            if (typeof shouldAddValidator === 'boolean' && shouldAddValidator) {
                this.handleValidator(validator, field, form);
            } else {
                this.handleValidator(validator, field, form, true);
            }
        });
    }

    handleValidator(validator: TValidator, field: TField, form: FormGroup, remove = false) {
        const type = validator.type;

        const value = validator.value;

        switch (type) {
            case 'REQUIRED':
                this.updateRequiredValidator(field.id, field.subsectionId, field.sectionId, form, remove);
                break;

            case 'PATTERN':
                if (value && (typeof value === 'string' || value instanceof RegExp)) {
                    this.updatePatternValidator(value, field.id, field.subsectionId, field.sectionId, form, remove);
                }
                break;

            case 'MIN':
                if (value && typeof value === 'number') {
                    this.updateMinValidator(value, field.id, field.subsectionId, field.sectionId, form, remove);
                }
                break;

            case 'MAX':
                if (value && typeof value === 'number') {
                    this.updateMaxValidator(value, field.id, field.subsectionId, field.sectionId, form, remove);
                }
                break;

            case 'MIN_LENGTH':
                if (value && typeof value === 'number') {
                    this.updateMinLengthValidator(value, field.id, field.subsectionId, field.sectionId, form, remove);
                }
                break;

            case 'MAX_LENGTH':
                if (value && typeof value === 'number') {
                    this.updateMaxLengthValidator(value, field.id, field.subsectionId, field.sectionId, form, remove);
                }
                break;

            default:
                break;
        }
    }
}
