import { z } from 'zod';

import { ConditionSchema } from './condition.schema';
import { IdSchema } from './id.schema';

export const ValidatorCommonSchema = z.object({
    condition: ConditionSchema.optional(),
    message: z.string(),
});

export type TValidatorCommon = z.infer<typeof ValidatorCommonSchema>;

export const ValidatorSchema = z
    .union([
        z.object({
            type: z.literal('REQUIRED'),
        }),
        z.object({
            type: z.literal('PATTERN'),
            value: z.string().optional(),
        }),
        z.object({
            type: z.enum(['MIN', 'MAX', 'MIN_LENGTH', 'MAX_LENGTH']),
            value: z.number().optional(),
        }),
    ])
    .and(ValidatorCommonSchema);

export type TValidator = z.infer<typeof ValidatorSchema>;

export const ValidatorListSchema = z.array(ValidatorSchema);

export type TValidatorList = z.infer<typeof ValidatorListSchema>;

export const ValidatorsSchema = z.object({
    value: ValidatorListSchema,
    dependsOn: z.array(IdSchema).optional(),
});

export type TValidators = z.infer<typeof ValidatorsSchema>;
