import { array, boolean, literal, number, object, record, string, union, unknown, z } from 'zod';

import { ConditionSchema } from './condition.schema';
import { IdSchema } from './id.schema';
import { ValidatorSchema } from './validator.schema';

export const FieldTagSchema = z.enum([
    'input',
    'textarea',
    'select',
    'autocomplete',
    'date',
    'time',
    'datetime',
    'range',
    'radio',
    'checkbox',
]);

export const FieldBaseSchema = object({
    id: IdSchema,
    sectionId: IdSchema,
    subsectionId: IdSchema,
    name: string().optional(),
    label: string().optional(),
    path: string(),
    tag: FieldTagSchema, // TODO: Need to handle
    type: z.enum(['text', 'number']).optional(), // TODO: Need to handle
    defaultValue: unknown().optional(), // TODO: Need to handle
    hint: string().optional(),
    value: ConditionSchema.optional(),
    valueDependsOn: array(IdSchema).optional(),
    disable: union([boolean(), ConditionSchema]).optional(),
    disableDependsOn: array(IdSchema).optional(),
    readonly: boolean().optional(), // if readonly, then cannot change value direct or indirectly
    show: union([boolean(), ConditionSchema]).optional(), // TODO: test with readonly field
    showDependsOn: array(IdSchema).optional(),
    hide: union([boolean(), ConditionSchema]).optional(),
    hideDependsOn: array(IdSchema).optional(),
    validators: array(ValidatorSchema).optional(),
    validatorsDependsOn: array(IdSchema).optional(),
});

export const InputFieldSchema = FieldBaseSchema.extend({
    tag: z.literal('input'),
    type: z.enum(['text', 'number']),
});

export const InputFieldDisableSchema = InputFieldSchema.extend({});

export const InputTextFieldSchema = InputFieldSchema.extend({
    type: z.literal('text'),
    defaultValue: string().optional(),
});

export const InputTextFieldReadonlySchema = InputTextFieldSchema.omit({
    value: true,
    validatorsDependsOn: true,
    disable: true,
    disableDependsOn: true,
    validators: true,
    valueDependsOn: true,
}).extend({
    readonly: z.literal(true),
});

export const InputTextFieldReadAndWriteSchema = InputTextFieldSchema.extend({
    readonly: literal(false).optional(),
});

// number field
export const InputNumberFieldSchema = InputFieldSchema.extend({
    type: literal('number'),
    defaultValue: number().optional(),
});

export const InputNumberFieldReadonlySchema = InputNumberFieldSchema.omit({
    value: true,
    validatorsDependsOn: true,
    disable: true,
    disableDependsOn: true,
    validators: true,
    valueDependsOn: true,
}).extend({
    readonly: z.literal(true),
});

export const InputNumberFieldReadAndWriteSchema = InputNumberFieldSchema.extend({
    readonly: literal(false).optional(),
});

// text area
export const TextareaFieldSchema = FieldBaseSchema.omit({
    type: true,
}).extend({
    tag: literal('textarea'),
});

export const TextareaFieldReadonlySchema = TextareaFieldSchema.omit({
    value: true,
    validatorsDependsOn: true,
    disable: true,
    disableDependsOn: true,
    validators: true,
    valueDependsOn: true,
}).extend({
    readonly: literal(true),
});

export const TextareaFieldReadAndWriteSchema = TextareaFieldSchema.extend({
    readonly: literal(false).optional(),
});

export const OptionsConfigSchema = object({
    primaryValueDataPath: string().optional(), // only for object values
    secondaryValueDataPaths: array(string()).optional(), // only for object values
    multiple: boolean().optional(),
});

// select
export const SelectFieldSchema = FieldBaseSchema.omit({
    type: true,
}).extend({
    tag: literal('select'),
    options: array(union([unknown(), record(union([string(), number()]), unknown())])),
    optionsConfig: OptionsConfigSchema.optional(),
});

// export const SelectFieldPremitiveOptionsSchema = SelectFieldBaseSchema.extend({
//     options: array(unknown()),
// })

// export const SelectFieldRecordOptionsSchema = SelectFieldBaseSchema.extend({
//     options: array(record(union([string(), number()]))),
// })

// export const SelectFieldSchema = union([SelectFieldPremitiveOptionsSchema, SelectFieldRecordOptionsSchema])

export const SelectFieldReadonlySchema = SelectFieldSchema.omit({
    value: true,
    validatorsDependsOn: true,
    disable: true,
    disableDependsOn: true,
    validators: true,
    valueDependsOn: true,
}).extend({
    readonly: literal(true),
});

export const SelectFieldReadAndWriteSchema = SelectFieldSchema.extend({
    readonly: literal(false).optional(),
});

export const InputFieldReadonlySchema = union([InputTextFieldReadonlySchema, InputNumberFieldReadonlySchema]);
export const InputFieldReadAndWriteSchema = union([
    InputTextFieldReadAndWriteSchema,
    InputNumberFieldReadAndWriteSchema,
]);

export const FieldReadonlySchema = union([
    InputFieldReadonlySchema,
    TextareaFieldReadonlySchema,
    SelectFieldReadonlySchema,
]);
export const FieldReadAndWriteSchema = union([
    InputFieldReadAndWriteSchema,
    TextareaFieldReadAndWriteSchema,
    SelectFieldReadAndWriteSchema,
]);

export const FieldSchema = union([FieldReadonlySchema, FieldReadAndWriteSchema]);

export const FieldMapSchema = record(IdSchema, FieldSchema);

export type TFieldTag = z.infer<typeof FieldTagSchema>;
export type TFieldMap = z.infer<typeof FieldMapSchema>;
export type TFieldBase = z.infer<typeof FieldBaseSchema>;

export type TInputField = z.infer<typeof InputFieldSchema>;

export type TInputTextField = z.infer<typeof InputTextFieldSchema>;
export type TInputTextFieldReadonly = z.infer<typeof InputTextFieldReadonlySchema>;
export type TInputTextFieldReadAndWrite = z.infer<typeof InputTextFieldReadAndWriteSchema>;

export type TInputNumberField = z.infer<typeof InputNumberFieldSchema>;
export type TInputNumberFieldReadonly = z.infer<typeof InputNumberFieldReadonlySchema>;
export type TInputNumberFieldReadAndWrite = z.infer<typeof InputNumberFieldReadAndWriteSchema>;

export type TTextareaField = z.infer<typeof TextareaFieldSchema>;
export type TTextareaFieldReadonly = z.infer<typeof TextareaFieldReadonlySchema>;
export type TTextareaFieldReadAndWrite = z.infer<typeof TextareaFieldReadAndWriteSchema>;

export type TSelectField = z.infer<typeof SelectFieldSchema>;
export type TSelectFieldReadonly = z.infer<typeof SelectFieldReadonlySchema>;
export type TSelectFieldReadAndWrite = z.infer<typeof SelectFieldReadAndWriteSchema>;

export type TInputFieldReadonly = z.infer<typeof InputFieldReadonlySchema>;
export type TInputFieldReadAndWrite = z.infer<typeof InputFieldReadAndWriteSchema>;

export type TFieldReadonly = z.infer<typeof FieldReadonlySchema>;
export type TFieldReadAndWrite = z.infer<typeof FieldReadAndWriteSchema>;

export type TField = z.infer<typeof FieldSchema>;
