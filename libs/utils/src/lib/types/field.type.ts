import { TId } from './id.type';
import { TValueCalculation } from './value-calculation.type';

export type TField = {
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
    // defaultValue?: any;
    value?: TValueCalculation;
    calculateValueInitially?: boolean;
    show?: boolean;
};
