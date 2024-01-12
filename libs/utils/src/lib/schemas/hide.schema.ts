import { z } from 'zod';

import { ConditionSchema } from './condition.schema';
import { IdSchema } from './id.schema';

export const HideSchema = z.object({
    value: z.union([z.boolean(), ConditionSchema]),
    dependsOn: z.array(IdSchema).optional(),
});

export type THide = z.infer<typeof HideSchema>;
