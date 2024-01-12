import { z } from 'zod';

export const TextareaFieldSchema = z.object({
    tag: z.literal('TEXTAREA'),
    defaultValue: z.string().optional(),
});

export type TTextareaField = z.infer<typeof TextareaFieldSchema>;
