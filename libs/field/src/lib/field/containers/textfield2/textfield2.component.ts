import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Global2Service, TConditionZod, TDataMapZod, TFieldZod, getFromJson, setToJson } from '@formflix/utils';

import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'formflix-textfield2',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './textfield2.component.html',
    styleUrl: './textfield2.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Textfield2Component implements OnInit, OnDestroy {
    @Input({ required: true }) field!: TFieldZod;

    #global2Service = inject(Global2Service);

    formControl!: FormControl;
    currentValueTrigger$!: Subject<symbol> | undefined;
    currentDisableTrigger$!: Subject<symbol> | undefined;

    destroy$ = new Subject<void>();

    ngOnInit(): void {
        const { id, subsectionId, sectionId } = this.field;

        this.formControl = this.#global2Service.getFieldFormRef(id, subsectionId, sectionId);
        this.currentValueTrigger$ = this.#global2Service.getCurrentFieldValueObserver(id);
        this.currentDisableTrigger$ = this.#global2Service.getCurrentFieldDisableObserver(id);

        this.handleCurrentObserver();

        // trigger disable
        this.#global2Service.triggerAllFieldDisableObservers();
    }

    handleCurrentObserver() {
        this.currentValueTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const calculatedValue = this.getCalculatedValue();

            console.log({ calculatedValue });

            const { id, subsectionId, sectionId } = this.field;

            this.#global2Service.updateFormValue(calculatedValue, id, subsectionId, sectionId);
            this.handleFormValue(calculatedValue);
        });

        this.currentDisableTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const disable = this.isDisable();

            console.log(this.field.label, disable);

            this.#global2Service.disableFieldForm(
                disable ? true : false,
                this.field.id,
                this.field.subsectionId,
                this.field.sectionId,
            );
        });
    }

    updateSource(value: unknown) {
        setToJson(this.field.path, this.#global2Service.getSource()(), value);

        console.log(this.#global2Service.getSource()());
    }

    handleFormValue(value: unknown) {
        // TODO: Convert to number if field type is number
        this.updateSource(value);
        this.triggerDependencies();
    }

    // handleFormDisable(value: boolean) {
    //     this.#global2Service.disableFieldForm(value, this.field.id, this.field.subsectionId, this.field.sectionId)
    //     // this.triggerFieldDisableDependentObservers()
    // }

    handleFormInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;

        this.handleFormValue(value);
    }

    // return calculated value
    getCalculatedValue() {
        const valueCondition = this.field?.value;

        if (!valueCondition) return;

        return this.getConditionResult(valueCondition);
    }

    isDisable() {
        const disable = this.field?.disable;

        if (disable === undefined) return false;

        if (typeof disable === 'boolean') {
            return disable;
        }

        return this.getConditionResult(disable);
    }

    // -------- start: calculation ------------------

    // use functions to calculate
    calculateWithFn(dataMap: TDataMapZod, key: string, currentValue: unknown) {
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
    getCalculateExpressionValueMap(keys: string[], dataMap: TDataMapZod) {
        const expressionValueMap: Record<string, unknown> = {};

        for (const key of keys) {
            const query = dataMap[key]?.query;

            const value = getFromJson(query, this.#global2Service.getSource()());

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
    getConditionResult(condition: TConditionZod): unknown {
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
        const dependentIds = this.#global2Service.getFieldValueDependentFieldIds(this.field.id) ?? [];

        console.log('dependent ids', dependentIds);

        dependentIds.forEach((dependentId) => {
            this.#global2Service.triggerFieldValueDependentObserver(dependentId);
        });
    }

    triggerFieldDisableDependentObservers() {
        const dependentIds = this.#global2Service.getFieldDisableDependentFieldIds(this.field.id) ?? [];

        console.log('dependent ids', dependentIds);

        dependentIds.forEach((dependentId) => {
            this.#global2Service.triggerFieldDisableDependentObserver(dependentId);
        });
    }

    // trigger dependent fields
    triggerDependencies() {
        this.triggerFieldValueDependentObservers();
        this.triggerFieldDisableDependentObservers();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
