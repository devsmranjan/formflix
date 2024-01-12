import { z } from 'zod';

import { DisableSchema } from './disable.schema';
import { FieldTypesSchema } from './field-types.schema';
import { HideSchema } from './hide.schema';
import { IdSchema } from './id.schema';
import { ShowSchema } from './show.schema';
import { ValidatorsSchema } from './validator.schema';
import { ValueSchema } from './value.schema';

export const FieldSchema = z
    .object({
        id: IdSchema,
        sectionId: IdSchema,
        subsectionId: IdSchema,
        name: z.string().optional(),
        label: z.string().optional(),
        path: z.string(),
        hint: z.string().optional(),
        disable: DisableSchema.optional(),
        value: ValueSchema.optional(),
        show: ShowSchema.optional(),
        hide: HideSchema.optional(),
        validators: ValidatorsSchema.optional(),
        readonly: z.boolean().optional(),
    })
    .and(FieldTypesSchema)
    .superRefine((val, ctx) => {
        if (val.readonly === true) {
            // if readonly true, and disable is there, show error for disable that, it cannot be present
            if (val.disable !== undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'disable cannot be present when readonly is true',
                    path: ['disable'],
                });
            }

            // if readonly true, and value is there, show error for value that, it cannot be present
            if (val.value !== undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'value cannot be present when readonly is true',
                    path: ['value'],
                });
            }

            // if readonly true, and show is there, show error for show that, it cannot be present
            if (val.show !== undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'show cannot be present when readonly is true',
                    path: ['show'],
                });
            }

            // if readonly true, and hide is there, show error for hide that, it cannot be present
            if (val.hide !== undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'hide cannot be present when readonly is true',
                    path: ['hide'],
                });
            }

            // if readonly true, and validators is there, show error for validators that, it cannot be present
            if (val.validators !== undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'validators cannot be present when readonly is true',
                    path: ['validators'],
                });
            }
        }
    });

export type TField = z.infer<typeof FieldSchema>;

export const FieldMapSchema = z.record(IdSchema, FieldSchema);

export type TFieldMap = z.infer<typeof FieldMapSchema>;
