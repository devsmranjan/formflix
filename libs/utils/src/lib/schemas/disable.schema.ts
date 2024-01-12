import { z } from 'zod';

import { ConditionSchema } from './condition.schema';
import { IdSchema } from './id.schema';

export const DisableSchema = z.object({
    value: z.union([z.boolean(), ConditionSchema]),
    dependsOn: z.array(IdSchema).optional(),
});

export type TDisable = z.infer<typeof DisableSchema>;
