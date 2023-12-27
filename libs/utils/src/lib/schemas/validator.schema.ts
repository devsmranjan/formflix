import { object, string, unknown, z } from 'zod';

import { ConditionSchema } from './condition.schema';

export const ValidatorSchema = object({
    type: z.enum(['REQUIRED', 'PATTERN', 'MIN', 'MAX', 'MIN_LENGTH', 'MAX_LENGTH']),
    value: unknown().optional(), // for pattern
    condition: ConditionSchema.optional(),
    message: string(),
});

export type TValidator = z.infer<typeof ValidatorSchema>;
