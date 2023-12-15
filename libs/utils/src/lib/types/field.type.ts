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
    readonly?: boolean;
    dependsOn?: TId[];
    defaultValue?: unknown;
    value?: TValueCalculation;
    calculateValueInitially?: boolean;
    show?: boolean;
};

export type TInputField = {
    tag: EFieldTag.Input;
    type: 'text' | 'number';
} & TFieldBase;

export type TInputTextField = {
    type: 'text';
    defaultValue?: string;
} & TInputField;

export type TInputNumberField = {
    type: 'number';
    defaultValue?: number;
} & TInputField;

export type TTextareaField = {
    tag: EFieldTag.Textarea;
} & Omit<TFieldBase, 'type'>;

export type TField = TInputTextField | TInputNumberField | TTextareaField;
