import { z } from 'zod';

export const IdSchema = z.union([z.string(), z.number()]);

export type TId = z.infer<typeof IdSchema>;
