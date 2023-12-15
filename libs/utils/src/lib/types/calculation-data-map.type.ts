import { TFn } from './fn.type';

export type TCalculationDataMap = Record<string, { query: string; fn?: TFn }>;
