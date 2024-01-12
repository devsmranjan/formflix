import { z } from 'zod';

export const OptionListWithPremitiveValueSchema = z.object({
    value: z.array(z.union([z.string(), z.number()])),
    multiple: z.boolean().optional(),
    dataPaths: z.undefined(),
});

export type TOptionListWithPremitiveValue = z.infer<typeof OptionListWithPremitiveValueSchema>;

export const OptionListWithObjectValueSchema = z.object({
    value: z.array(z.record(z.union([z.string(), z.number()]), z.unknown())),
    dataPaths: z
        .object({
            primary: z.string().optional(),
            secondary: z.array(z.string()).optional(),
        })
        .optional(),
    multiple: z.boolean().optional(),
});

export type TOptionListWithObjectValue = z.infer<typeof OptionListWithObjectValueSchema>;

export const OptionListSchema = z.union([OptionListWithPremitiveValueSchema, OptionListWithObjectValueSchema]);

export type TOptionList = z.infer<typeof OptionListSchema>;

export const SelectFieldSchema = z.object({
    tag: z.literal('SELECT'),
    defaultValue: z.unknown().optional(),
    options: OptionListSchema,
});

export type TSelectField = z.infer<typeof SelectFieldSchema>;
