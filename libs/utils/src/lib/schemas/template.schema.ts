import { array, boolean, number, object, record, string, union, unknown, z } from 'zod';

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

export const ValidatorSchema = object({
    type: z.enum(['REQUIRED', 'PATTERN', 'MIN', 'MAX', 'MIN_LENGTH', 'MAX_LENGTH']),
    value: unknown().optional(), // for pattern
    condition: ConditionSchema.optional(),
    message: string(),
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
    disable: union([boolean(), ConditionSchema]).optional(),
    disableDependsOn: array(IdSchema).optional(),
    readonly: boolean().optional(),
    show: union([boolean(), ConditionSchema]).optional(),
    showDependsOn: array(IdSchema).optional(),
    hide: union([boolean(), ConditionSchema]).optional(),
    hideDependsOn: array(IdSchema).optional(),
    validators: array(ValidatorSchema).optional(),
    validatorsDependsOn: array(IdSchema).optional(),
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
export type TValidatorZod = z.infer<typeof ValidatorSchema>;
