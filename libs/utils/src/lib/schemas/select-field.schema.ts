import { z } from 'zod';

export const OptionSchema = z.union([
    z.object({
        value: z.union([z.string(), z.number()]),
        multiple: z.boolean().optional(),
    }),

    z.object({
        value: z.record(z.union([z.string(), z.number()]), z.unknown()),
        dataPaths: z
            .object({
                primary: z.string().optional(),
                secondary: z.array(z.string()).optional(),
            })
            .optional(),
        multiple: z.boolean().optional(),
    }),
]);

export type TOption = z.infer<typeof OptionSchema>;

export const SelectFieldSchema = z.object({
    tag: z.literal('SELECT'),
    defaultValue: z.unknown().optional(),
    options: z.array(OptionSchema),
});

export type TSelectField = z.infer<typeof SelectFieldSchema>;
