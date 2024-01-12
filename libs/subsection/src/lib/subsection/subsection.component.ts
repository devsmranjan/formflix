import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';

import { FieldComponent } from '@formflix/field';
import { GlobalService, TCondition, TDataMap, TField, TSubsection, getFromJson } from '@formflix/utils';

import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'formflix-subsection',
    standalone: true,
    imports: [CommonModule, FieldComponent],
    templateUrl: './subsection.component.html',
    styleUrl: './subsection.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubsectionComponent implements OnInit, OnDestroy {
    globalService = inject(GlobalService);

    @Input({ required: true }) subsection!: TSubsection;

    fields = signal<TField[]>([]);

    destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.handleFieldShowHideObserver();
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

            const value = getFromJson(query, this.globalService.getSource()());

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
            console.error(`error:`, error);
        }

        return;
    }

    // ---------------------- end: calculation -------------

    shouldShowField(field: TField) {
        const show = field?.show?.value;

        if (show === undefined) return true;

        if (typeof show === 'boolean') {
            return show;
        }

        const result = this.getConditionResult(show);

        console.log('result ----------------------- ', result, result === undefined);

        return result === undefined ? false : result;
    }

    shouldHideField(field: TField) {
        const hide = field?.hide?.value;

        if (hide === undefined) return false;

        if (typeof hide === 'boolean') {
            return hide;
        }

        const result = this.getConditionResult(hide);

        // console.log("result hide ----------------------- ", result, result === undefined)

        return result === undefined ? false : result;
    }

    shouldBeVisible(field: TField) {
        let visible = true;

        // show
        if (field.show !== undefined) {
            const shouldShow = this.shouldShowField(field);

            if (typeof shouldShow === 'boolean') {
                visible = shouldShow;
            }

            console.log('visible after should show ----------------', field.name, visible);
        }

        // hide
        if (field.hide !== undefined) {
            const shouldHide = this.shouldHideField(field);

            if (typeof shouldHide === 'boolean') {
                visible = !shouldHide;
            }

            console.log('visible after should hide ----------------', field.name, visible);
        }

        return visible;
    }

    handleFields() {
        let fields = this.globalService.getFields(this.subsection.id, this.subsection.sectionId);

        console.log('fields ------', fields);

        fields = fields.filter((field) => {
            const shouldVisible = this.shouldBeVisible(field);

            if (shouldVisible) {
                this.globalService.triggerFieldDisableDependentObserver(field.id);
            }

            return shouldVisible;
        });

        console.log('fields after filter ------', fields);

        this.fields.set(fields);
    }

    handleFieldShowHideObserver() {
        const current$ = this.globalService.getCurrentSubsetionFieldShowHideObserver(this.subsection.id);

        current$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            console.log('Current ---- ', this.subsection.id);

            this.handleFields();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
