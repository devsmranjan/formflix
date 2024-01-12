import { z } from 'zod';

export const DataMapSchema = z.record(
    z.string(),
    z.object({
        query: z.string(),
        fn: z.enum(['SUM', 'MULT', 'AVG', 'MAX', 'MIN', 'COUNT', 'FIRST', 'LAST']).optional(),
    }),
);

export type TDataMap = z.infer<typeof DataMapSchema>;

export const ConditionSchema = z.object({
    dataMap: DataMapSchema, // TODO: Make it optional
    expression: z.string(),
});

export type TCondition = z.infer<typeof ConditionSchema>;
