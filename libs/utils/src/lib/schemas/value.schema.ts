import { z } from 'zod';

import { ConditionSchema } from './condition.schema';
import { IdSchema } from './id.schema';

export const ValueSchema = z.object({
    value: ConditionSchema.optional(),
    dependsOn: z.array(IdSchema).optional(),
});

export type TValue = z.infer<typeof ValueSchema>;
