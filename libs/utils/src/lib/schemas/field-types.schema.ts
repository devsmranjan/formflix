import { z } from 'zod';

import { InputFieldSchema } from './input-field.schema';
import { SelectFieldSchema } from './select-field.schema';
import { TextareaFieldSchema } from './textarea.schema';

export const FieldTypesSchema = z.union([InputFieldSchema, TextareaFieldSchema, SelectFieldSchema]);

export type TFieldTypes = z.infer<typeof FieldTypesSchema>;
