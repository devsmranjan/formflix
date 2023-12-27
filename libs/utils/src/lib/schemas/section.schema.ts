import { object, record, string, z } from 'zod';

import { IdSchema } from './id.schema';
import { SubsectionMapSchema } from './subsection.schema';

export const SectionSchema = object({
    id: IdSchema,
    label: string().optional(),
    subsections: SubsectionMapSchema.optional(),
});

export const SectionMapSchema = record(IdSchema, SectionSchema);

export type TSectionMap = z.infer<typeof SectionMapSchema>;
export type TSection = z.infer<typeof SectionSchema>;
