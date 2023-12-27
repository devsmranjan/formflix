import { object, record, string, z } from 'zod';

import { FieldMapSchema } from './field.schema';
import { IdSchema } from './id.schema';

export const SubsectionSchema = object({
    id: IdSchema,
    sectionId: IdSchema,
    label: string().optional(),
    fields: FieldMapSchema.optional(),
});

export const SubsectionMapSchema = record(IdSchema, SubsectionSchema);

export type TSubsectionMap = z.infer<typeof SubsectionMapSchema>;
export type TSubsection = z.infer<typeof SubsectionSchema>;
