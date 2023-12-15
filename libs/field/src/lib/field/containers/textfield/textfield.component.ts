import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { GlobalService, TCalculationDataMap, TInputField, getFromJson, setToJson } from '@formflix/utils';

import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { BottomLabelComponent, TopLabelComponent } from '../../ui';

@Component({
    selector: 'formflix-textfield',
    standalone: true,
    imports: [CommonModule, BottomLabelComponent, TopLabelComponent, ReactiveFormsModule],
    templateUrl: './textfield.component.html',
    styleUrl: './textfield.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextfieldComponent implements OnInit, OnDestroy {
    @Input({ required: true }) field!: TInputField;

    #globalService = inject(GlobalService);

    formControl = new FormControl();
    error = signal<string | null>(null);

    destroy$ = new Subject<void>();

    ngOnInit(): void {
        console.log('text field component, field:', this.field);

        // set initial value
        this.setInitalValue();

        // handle form value change
        this.handleFormValueChange();
    }

    setInitalValue() {
        const { source } = this.#globalService;

        console.log({ source });

        if (!source) return;

        let value = getFromJson(this.field.path, source);

        if (value === undefined) {
            // handle default value
            value = this.field.defaultValue !== undefined ? this.field.defaultValue : value;
        }

        console.log('text field component, initial value:', value, value === undefined);

        // calculate value initially
        if (this.field.calculateValueInitially) {
            const calculatedValue = this.calculateValue();

            if (calculatedValue !== undefined) {
                value = calculatedValue;
            }
        }

        console.log('text field component, initial value after initial calculation:', value, value === undefined);

        // set value
        setToJson(this.field.path, source, value);

        // update in form control
        this.formControl.setValue(value);
    }

    handleFormValueChange() {
        this.formControl.valueChanges
            .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((value) => {
                console.log('form contol value', value);
            });
    }

    // -------- start: calculation ------------------

    calculateWithFn(dataMap: TCalculationDataMap, key: string, currentValue: unknown) {
        const fn = dataMap[key]?.fn;

        if (!fn) return currentValue;

        if (!Array.isArray(currentValue)) {
            console.log('current value is not an array, current value:', currentValue);
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

    getCalculateExpressionValueMap(keys: string[], dataMap: TCalculationDataMap) {
        const expressionValueMap: Record<string, unknown> = {};

        for (const key of keys) {
            const query = dataMap[key]?.query;

            const value = getFromJson(query, this.#globalService.source);

            if (value === null || value === undefined || value === '') {
                return;
            }

            expressionValueMap[key] = this.calculateWithFn(dataMap, key, value);
        }

        return expressionValueMap;
    }

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

    calculateValue() {
        const valueCondition = this.field?.value;

        if (!valueCondition) return;

        const { dataMap, expression } = valueCondition;

        const expressionKeys = Object.keys(dataMap);

        console.log('expression keys', expressionKeys);

        const expressionValueMap = this.getCalculateExpressionValueMap(expressionKeys, dataMap);
        if (!expressionValueMap) return;

        const finalExpression = this.getFinalExpression(expression, expressionKeys, expressionValueMap);

        // calculate value
        try {
            const calculatedValue = eval(finalExpression);

            console.log('calculated value', calculatedValue);

            return calculatedValue;
        } catch (error) {
            console.error(`error - ${this.field.label}:`, error);
            return;
        }
    }

    // ---------------------- end: calculation -------------

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
