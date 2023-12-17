import { TFn } from './fn.type';

export type TDataMap = Record<string, { query: string; fn?: TFn }>;
