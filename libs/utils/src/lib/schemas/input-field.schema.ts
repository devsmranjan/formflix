import { z } from 'zod';

export const InputFieldBaseSchema = z.object({
    tag: z.literal('INPUT'),
});

export type TInputFieldBase = z.infer<typeof InputFieldBaseSchema>;

export const InputTextFieldSchema = z
    .object({
        type: z.literal('text'),
        defaultValue: z.string().optional(),
    })
    .and(InputFieldBaseSchema);

export type TInputTextField = z.infer<typeof InputTextFieldSchema>;

export const InputNumberFieldSchema = z
    .object({
        type: z.literal('number'),
        defaultValue: z.number().optional(),
    })
    .and(InputFieldBaseSchema);

export type TInputNumberField = z.infer<typeof InputNumberFieldSchema>;

export const InputFieldSchema = z.union([InputTextFieldSchema, InputNumberFieldSchema]);

export type TInputField = z.infer<typeof InputFieldSchema>;
