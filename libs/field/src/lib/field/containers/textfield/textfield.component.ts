import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import {
    GlobalService,
    TCondition,
    TDataMap,
    TInputFieldReadAndWrite,
    TValidator,
    getFromJson,
    promiseWait,
    setToJson,
} from '@formflix/utils';

import { Subject, takeUntil } from 'rxjs';

import { BottomLabelComponent, TopLabelComponent } from '../../ui';

@Component({
    selector: 'formflix-textfield',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TopLabelComponent, BottomLabelComponent],
    templateUrl: './textfield.component.html',
    styleUrl: './textfield.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextfieldComponent implements OnInit, OnDestroy {
    @Input({ required: true }) field!: TInputFieldReadAndWrite;

    #globalService = inject(GlobalService);
    #changeDetectorRef = inject(ChangeDetectorRef);

    formControl!: FormControl;
    currentValueTrigger$!: Subject<symbol> | undefined;
    currentDisableTrigger$!: Subject<symbol> | undefined;
    currentValidatorTrigger$!: Subject<symbol> | undefined;

    destroy$ = new Subject<void>();

    ngOnInit(): void {
        const { id, subsectionId, sectionId } = this.field;

        this.formControl = this.#globalService.getFieldFormRef(id, subsectionId, sectionId);
        this.currentValueTrigger$ = this.#globalService.getCurrentFieldValueObserver(id);
        this.currentDisableTrigger$ = this.#globalService.getCurrentFieldDisableObserver(id);
        this.currentValidatorTrigger$ = this.#globalService.getCurrentFieldValidatorObserver(id);

        this.handleCurrentObserver();

        // trigger disable
        this.#globalService.triggerAllFieldDisableObservers();
        this.#globalService.triggerAllFieldValidatorObservers();
    }

    handleCurrentObserver() {
        this.currentValueTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const calculatedValue = this.getCalculatedValue();

            console.log({ calculatedValue });

            const { id, subsectionId, sectionId } = this.field;

            this.#globalService.updateFormValue(calculatedValue, id, subsectionId, sectionId);
            this.handleFormValue(calculatedValue);
        });

        this.currentDisableTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const disable = this.isDisable();

            console.log(this.field.label, disable);

            this.#globalService.disableFieldForm(
                disable ? true : false,
                this.field.id,
                this.field.subsectionId,
                this.field.sectionId,
            );
        });

        this.currentValidatorTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.field.readonly) return;

            const validators = this.field?.validators ?? [];

            validators.forEach((validator) => {
                const shouldAddValidator = this.shouldAddValidator(validator);

                console.log('shouldAddValidator', this.field.name, shouldAddValidator, validator.type);

                if (typeof shouldAddValidator === 'boolean' && shouldAddValidator) {
                    this.handleValidators(validator);

                    console.log(
                        'shouldAddValidator 2',
                        this.field.name,
                        this.formControl.hasValidator(Validators.required),
                    );
                } else {
                    this.handleValidators(validator, true);
                }
            });

            this.formControl.updateValueAndValidity();
            this.#changeDetectorRef.detectChanges();
        });
    }

    handleValidators(validator: TValidator, remove = false) {
        const type = validator.type;

        const value = validator.value;

        switch (type) {
            case 'REQUIRED':
                this.#globalService.updateRequiredValidator(
                    this.field.id,
                    this.field.subsectionId,
                    this.field.sectionId,
                    remove,
                );
                break;

            case 'PATTERN':
                if (value && (typeof value === 'string' || value instanceof RegExp)) {
                    this.#globalService.updatePatternValidator(
                        value,
                        this.field.id,
                        this.field.subsectionId,
                        this.field.sectionId,
                        remove,
                    );
                }
                break;

            case 'MIN':
                if (value && typeof value === 'number') {
                    this.#globalService.updateMinValidator(
                        value,
                        this.field.id,
                        this.field.subsectionId,
                        this.field.sectionId,
                        remove,
                    );
                }
                break;

            case 'MAX':
                if (value && typeof value === 'number') {
                    this.#globalService.updateMaxValidator(
                        value,
                        this.field.id,
                        this.field.subsectionId,
                        this.field.sectionId,
                        remove,
                    );
                }
                break;

            case 'MIN_LENGTH':
                if (value && typeof value === 'number') {
                    this.#globalService.updateMinLengthValidator(
                        value,
                        this.field.id,
                        this.field.subsectionId,
                        this.field.sectionId,
                        remove,
                    );
                }
                break;

            case 'MAX_LENGTH':
                if (value && typeof value === 'number') {
                    this.#globalService.updateMaxLengthValidator(
                        value,
                        this.field.id,
                        this.field.subsectionId,
                        this.field.sectionId,
                        remove,
                    );
                }
                break;

            default:
                break;
        }
    }

    updateSource(value: unknown) {
        setToJson(this.field.path, this.#globalService.getSource()(), value);

        console.log(this.#globalService.getSource()());
    }

    handleFormValue(value: unknown) {
        // TODO: Convert to number if field type is number
        this.updateSource(value);
        this.triggerDependencies();

        console.log('this.formControl', this.field.name, this.formControl);
    }

    handleFormInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;

        this.handleFormValue(value);
    }

    // return calculated value
    getCalculatedValue() {
        if (this.field.readonly) return;

        const valueCondition = this.field?.value;

        if (!valueCondition) return;

        return this.getConditionResult(valueCondition);
    }

    isDisable() {
        if (this.field.readonly) return;

        const disable = this.field?.disable;

        if (disable === undefined) return false;

        if (typeof disable === 'boolean') {
            return disable;
        }

        return this.getConditionResult(disable);
    }

    shouldAddValidator(validator: TValidator) {
        if (!validator?.condition) return true;

        return this.getConditionResult(validator?.condition);
    }

    // -------- start: calculation ------------------

    // use functions to calculate
    calculateWithFn(dataMap: TDataMap, key: string, currentValue: unknown) {
        const fn = dataMap[key]?.fn;

        if (!fn) return currentValue;

        if (!Array.isArray(currentValue)) {
            console.log('current value is not an array, current value:', currentValue);
            return currentValue;
        }

        if (currentValue.length === 0) {
            return currentValue;
        }

        switch (fn) {
            case 'SUM':
                return currentValue.reduce((a: number, b: number) => a + b, 0);
            case 'MULT':
                return currentValue.reduce((a: number, b: number) => a * b, 1);
            case 'AVG':
                return currentValue.reduce((a: number, b: number) => a + b, 0) / currentValue.length;
            case 'MAX':
                return Math.max(...currentValue);
            case 'MIN':
                return Math.min(...currentValue);
            case 'COUNT':
                return currentValue.length;
            case 'FIRST':
                return currentValue.at(0);
            case 'LAST':
                return currentValue.at(-1);
            default:
                return currentValue;
        }
    }

    // create value map for expression from dataMap
    getCalculateExpressionValueMap(keys: string[], dataMap: TDataMap) {
        const expressionValueMap: Record<string, unknown> = {};

        for (const key of keys) {
            const query = dataMap[key]?.query;

            const value = getFromJson(query, this.#globalService.getSource()());

            if (value === null || value === undefined || value === '') {
                return;
            }

            expressionValueMap[key] = this.calculateWithFn(dataMap, key, value);
        }

        return expressionValueMap;
    }

    // generate final expression and return
    getFinalExpression(expression: string, keys: string[], valueMap: Record<string, unknown>) {
        let finalExpression = expression;

        keys.forEach((key) => {
            const regex = new RegExp(`{${key}}`, 'g');

            const value = valueMap[key];

            if (typeof value === 'string' || typeof value === 'number') {
                finalExpression = finalExpression.replaceAll(regex, `${value}`);
            }
        });

        return finalExpression;
    }

    // get result from condition
    getConditionResult(condition: TCondition): unknown {
        const { dataMap, expression } = condition;

        const expressionKeys = Object.keys(dataMap);

        console.log('expression keys', expressionKeys);

        const expressionValueMap = this.getCalculateExpressionValueMap(expressionKeys, dataMap);
        if (!expressionValueMap) return;

        const finalExpression = this.getFinalExpression(expression, expressionKeys, expressionValueMap);

        // calculate value
        try {
            const calculatedValue = (0, eval)(finalExpression);

            console.log('calculated value', calculatedValue);

            return calculatedValue;
        } catch (error) {
            console.error(`error - ${this.field.label}:`, error);
        }

        return;
    }

    // ---------------------- end: calculation -------------

    triggerFieldValueDependentObservers() {
        const dependentIds = this.#globalService.getFieldValueDependentFieldIds(this.field.id);

        console.log('dependent ids', dependentIds);

        dependentIds?.forEach((dependentId) => {
            this.#globalService.triggerFieldValueDependentObserver(dependentId);
        });
    }

    triggerFieldDisableDependentObservers() {
        const dependentIds = this.#globalService.getFieldDisableDependentFieldIds(this.field.id);

        console.log('dependent ids', dependentIds);

        dependentIds?.forEach((dependentId) => {
            this.#globalService.triggerFieldDisableDependentObserver(dependentId);
        });
    }

    triggerFieldValidatorsDependentObservers() {
        const dependentIds = this.#globalService.getFieldValidatorsDependentFieldIds(this.field.id);

        console.log('dependent ids', dependentIds);

        dependentIds?.forEach((dependentId) => {
            this.#globalService.triggerFieldValidatorDependentObserver(dependentId);
        });
    }

    // trigger dependent fields
    async triggerDependencies() {
        this.#globalService.triggerShowHideObservers(this.field.id);

        await promiseWait(100);

        this.triggerFieldDisableDependentObservers();

        this.triggerFieldValueDependentObservers();
        this.triggerFieldValidatorsDependentObservers();
    }

    // validators
    hasRequiredValidator() {
        return this.formControl.hasValidator(Validators.required);
    }

    getErrorMessages() {
        const errors = this.formControl.errors;

        if (errors === null) return;

        const errorMessages: string[] = [];

        Object.keys(errors).forEach((key) => {
            const errorMessage = this.errorMessage(key);

            if (errorMessage !== null && errorMessage !== undefined) {
                errorMessages.push(errorMessage);
            }
        });

        return errorMessages;
    }

    errorMessage(key: string) {
        switch (key) {
            case 'required':
                return this.requiredErrorMessage();

            case 'pattern':
                return this.patternErrorMessage();

            case 'min':
                return this.minErrorMessage();

            default:
                return null;
        }
    }

    requiredErrorMessage() {
        if (this.field.readonly) return;

        const validator = this.field.validators?.find((validator) => validator.type === 'REQUIRED');

        return validator?.message;
    }

    patternErrorMessage() {
        if (this.field.readonly) return;

        const patternFromValidator = this.formControl.errors?.['pattern']?.requiredPattern;

        const validator = this.field.validators?.find(
            (validator) => validator.type === 'PATTERN' && validator.value === patternFromValidator,
        );

        return validator?.message;
    }

    minErrorMessage() {
        if (this.field.readonly) return;

        const minFromValidator = this.formControl.errors?.['min']?.min;

        const validator = this.field.validators?.find(
            (validator) => validator.type === 'MIN' && validator.value === minFromValidator,
        );

        return validator?.message;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
/**
 * Custoom validator
 * Strong type check
 * input type variable
 * Refactor duplicate code
 * Textarea, date field, select etc.
 * Autocomplete
 * API integration feature
 * Refcator
 * UI
 */
