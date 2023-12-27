import { object, record, string, z } from 'zod';

export const DataMapSchema = record(
    string(),
    object({
        query: string(),
        fn: z.enum(['SUM', 'MULT', 'AVG', 'MAX', 'MIN', 'COUNT', 'FIRST', 'LAST']).optional(),
    }),
);

export const ConditionSchema = object({
    dataMap: DataMapSchema,
    expression: string(),
});

export type TCondition = z.infer<typeof ConditionSchema>;
export type TDataMap = z.infer<typeof DataMapSchema>;
