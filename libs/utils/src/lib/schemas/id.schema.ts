import { number, string, union, z } from 'zod';

export const IdSchema = union([string(), number()]);

export type TId = z.infer<typeof IdSchema>;
