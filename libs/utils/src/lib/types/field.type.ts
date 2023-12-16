import { TId } from './id.type';
import { TValueCalculation } from './value-calculation.type';

export enum EFieldTag {
    Input = 'input',
    Textarea = 'textarea',
    Select = 'select',
    Autocomplete = 'autocomplete',
    Date = 'date',
    Time = 'time',
    DateTime = 'datetime',
    Range = 'range',
    Radio = 'radio',
    Checkbox = 'checkbox',
}

export type TFieldBase = {
    id: TId;
    label: string;
    name: string;
    tag: string;
    type: string;
    path: string;
    hint?: string;
    required?: boolean;
    readonly?: boolean; // if readonly, then cannot change value direct or indirectly
    defaultValue?: unknown;
    show?: boolean;
    dependsOn?: TId[];
    value?: TValueCalculation;
    calculateValueInitially?: boolean;
};

export type TReadonlyOmit = 'dependsOn' | 'value' | 'calculateValueInitially';

export type TInputField = {
    tag: EFieldTag.Input;
    type: 'text' | 'number';
} & TFieldBase;

export type TInputTextField = {
    type: 'text';
    defaultValue?: string;
} & TInputField;

export type TInputTextFieldReadonly = {
    readonly: true;
} & Omit<TInputTextField, TReadonlyOmit>;

export type TInputTextFieldReadAndWrite = {
    readonly?: false;
} & TInputTextField;

export type TInputNumberField = {
    type: 'number';
    defaultValue?: number;
} & TInputField;

export type TInputNumberFieldReadonly = {
    readonly: true;
} & Omit<TInputNumberField, TReadonlyOmit>;

export type TInputNumberFieldReadAndWrite = {
    readonly?: false;
} & TInputNumberField;

export type TTextareaField = {
    tag: EFieldTag.Textarea;
} & Omit<TFieldBase, 'type'>;

export type TTextareaFieldReadonly = {
    readonly: true;
} & Omit<TTextareaField, TReadonlyOmit>;

export type TTextareaFieldReadAndWrite = {
    readonly?: false;
} & TTextareaField;

export type TInputFieldReadonly = TInputTextFieldReadonly | TInputNumberFieldReadonly;
export type TInputFieldReadAndWrite = TInputTextFieldReadAndWrite | TInputNumberFieldReadAndWrite;

export type TFieldReadonly = TInputFieldReadonly | TTextareaFieldReadonly;
export type TFieldReadAndWrite = TInputFieldReadAndWrite | TTextareaFieldReadAndWrite;

export type TField = TFieldReadonly | TFieldReadAndWrite;

/**
 * Based on condition
 * ------------------------------
 * disable
 * show
 * hide
 * required
 * validations
 */
