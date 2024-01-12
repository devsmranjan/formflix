import { Injectable } from '@angular/core';

import { getValueByQuery } from '../../helpers';
import { TCondition, TDataMap, TField } from '../../schemas';

@Injectable()
export class ConditionService {
    // use functions to calculate
    #calculateWithFn(dataMap: TDataMap, key: string, currentValue: unknown) {
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
    #getExpressionValueMap(keys: string[], dataMap: TDataMap, source: Record<string, unknown> | unknown[] | null) {
        const expressionValueMap: Record<string, unknown> = {};

        for (const key of keys) {
            const query = dataMap[key]?.query;

            const value = getValueByQuery(source, query);

            if (value === null || value === undefined || value === '') {
                return;
            }

            expressionValueMap[key] = this.#calculateWithFn(dataMap, key, value);
        }

        return expressionValueMap;
    }

    // generate final expression and return
    #getFinalExpression(expression: string, keys: string[], valueMap: Record<string, unknown>) {
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
    getResult(condition: TCondition, field: TField, source: Record<string, unknown> | unknown[] | null): unknown {
        const { dataMap, expression } = condition;

        const expressionKeys = Object.keys(dataMap);

        console.log('expression keys', expressionKeys);

        const expressionValueMap = this.#getExpressionValueMap(expressionKeys, dataMap, source);
        if (!expressionValueMap) return;

        const finalExpression = this.#getFinalExpression(expression, expressionKeys, expressionValueMap);

        // calculate value
        try {
            const calculatedValue = (0, eval)(finalExpression);

            console.log('calculated value', calculatedValue);

            return calculatedValue;
        } catch (error) {
            console.error(`error - ${field.label}:`, error);
        }

        return;
    }
}
