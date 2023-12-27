import { object, string, z } from 'zod';

import { SectionMapSchema } from './section.schema';

export const TemplateSchema = object({
    label: string().optional(),
    sections: SectionMapSchema.optional(),
});

export type TTemplate = z.infer<typeof TemplateSchema>;
