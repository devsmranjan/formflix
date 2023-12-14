import { TFn } from './fn.type';

export type TValueCalculation = {
    dataMap: Record<string, { query: string; fn?: TFn }>;
    expression: string;
};
