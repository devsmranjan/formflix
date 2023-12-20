import { array, number, object, record, string, union, z } from 'zod';

// const ID_REQUIRED_MESSAGE = 'Id is required';
// const SUBSECTION_ID_REQUIRED_MESSAGE = 'Subsection id is required';
// const SECTION_ID_REQUIRED_MESSAGE = 'Section id is required';

export const IdSchema = union([string(), number()]);

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

export const FieldSchema = object({
    id: IdSchema,
    sectionId: IdSchema,
    subsectionId: IdSchema,
    name: string().optional(),
    label: string().optional(),
    path: string(),
    value: ConditionSchema.optional(),
    valueDependsOn: array(IdSchema).optional(),
});

export const FieldsSchema = record(IdSchema, FieldSchema);

export const SubsectionSchema = object({
    id: IdSchema,
    sectionId: IdSchema,
    label: string().optional(),
    fields: FieldsSchema.optional(),
});

export const SubsectionsSchema = record(IdSchema, SubsectionSchema);

export const SectionSchema = object({
    id: IdSchema,
    label: string().optional(),
    subsections: SubsectionsSchema.optional(),
});

export const SectionsSchema = record(IdSchema, SectionSchema);

export const TemplateSchema = object({
    label: string().optional(),
    sections: SectionsSchema.optional(),
});

export type TIdZod = z.infer<typeof IdSchema>;
export type TTemplateZod = z.infer<typeof TemplateSchema>;
export type TSectionsZod = z.infer<typeof SectionsSchema>;
export type TSectionZod = z.infer<typeof SectionSchema>;
export type TSubsectionsZod = z.infer<typeof SubsectionSchema>;
export type TSubsectionZod = z.infer<typeof SubsectionSchema>;
export type TFieldsZod = z.infer<typeof FieldsSchema>;
export type TFieldZod = z.infer<typeof FieldSchema>;
export type TConditionZod = z.infer<typeof ConditionSchema>;
export type TDataMapZod = z.infer<typeof DataMapSchema>;
