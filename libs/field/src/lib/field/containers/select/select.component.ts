import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GlobalService, TField, TOptionListWithObjectValue, setToJson } from '@formflix/utils';

import { get } from 'lodash-es';
import { Subject, takeUntil } from 'rxjs';

import { BottomLabelComponent, TopLabelComponent } from '../../ui';

@Component({
    selector: 'formflix-select',
    standalone: true,
    imports: [CommonModule, TopLabelComponent, BottomLabelComponent, FormsModule, ReactiveFormsModule],
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements OnInit, OnDestroy {
    @Input({ required: true }) field!: TField;

    #globalService = inject(GlobalService);
    #changeDetectorRef = inject(ChangeDetectorRef);

    formControl!: FormControl;
    currentValueTrigger$!: Subject<symbol> | undefined;
    currentDisableTrigger$!: Subject<symbol> | undefined;
    currentValidatorTrigger$!: Subject<symbol> | undefined;

    destroy$ = new Subject<void>();

    selectedOptionAfterChange!: unknown; // new

    ngOnInit(): void {
        const { id, subsectionId, sectionId } = this.field;

        this.formControl = this.#globalService.getFieldFormRef(id, subsectionId, sectionId);
        this.currentValueTrigger$ = this.#globalService.getCurrentFieldValueObserver(id);
        this.currentDisableTrigger$ = this.#globalService.getCurrentFieldDisableObserver(id);
        this.currentValidatorTrigger$ = this.#globalService.getCurrentFieldValidatorObserver(id);

        this.handleCurrentObserver();

        // trigger disable for all fields
        this.#globalService.triggerAllFieldDisableObservers();

        // trigger validators
        this.#globalService.triggerAllFieldValidatorObservers();

        console.log('Form control value -------------------------- ');
        console.log(this.formControl);

        this.handleSelectInitialValue();
    }

    handleCurrentObserver() {
        this.currentValueTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const calculatedValue = this.#globalService.getAndUpdateCalculatedFieldFormValue(this.field);

            this.handleFormValue(calculatedValue);
        });

        this.currentDisableTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.#globalService.handleDisableFieldForm(this.field);
        });

        this.currentValidatorTrigger$?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.field.readonly) return;

            this.#globalService.fieldValidator.handleCurrentValidators(
                this.field,
                this.#globalService.getForm(),
                this.#globalService.shouldAddFieldValidator.bind(this.#globalService),
            );

            this.formControl.updateValueAndValidity();
            this.#changeDetectorRef.detectChanges();
        });
    }

    updateSource(value: unknown) {
        console.log({ value });

        setToJson(this.#globalService.getSource()(), this.field.path, value);

        console.log(this.#globalService.getSource()());
    }

    handleFormValue(value: unknown) {
        // TODO: Convert to number if field type is number
        this.updateSource(value);
        this.#globalService.triggerDependencies(this.field);
    }

    handleFormInput() {
        this.handleFormValue(this.formControl.value);

        console.log(this.#globalService.getSource()());
        console.log(this.formControl);
    }

    hasRequiredValidator() {
        return this.#globalService.fieldValidator.hasRequiredValidator(this.formControl);
    }

    getErrorMessages() {
        return this.#globalService.fieldValidator.getErrorMessages(this.field, this.formControl);
    }

    // start: specific to select -----------------------

    handleAndGetSelectValueAsArray(valueList: unknown[]) {
        if (valueList.length <= 0) return valueList;

        const result: unknown[] = [];

        valueList.forEach((value) => {
            if (!value) return;

            const selectedOption = this.handleSelectValue(value);

            result.push(selectedOption);
        });

        return result;
    }

    handleAndGetSelectValueAsObject(value: Record<string, unknown>) {
        if (this.field.tag !== 'SELECT') return value;

        if (this.field.options === undefined) return value;

        const options = this.field.options;
        const optionsValue = options?.value ?? [];

        if (optionsValue.length <= 0) return value;

        const firstOptionValue = optionsValue[0];

        if (firstOptionValue === null && typeof firstOptionValue !== 'object') return value;

        const finalOptions = this.field.options as TOptionListWithObjectValue; // TODO: Parse with schema

        const primaryValueDataPath = finalOptions?.dataPaths?.primary;

        if (primaryValueDataPath === undefined) return value;

        const primaryValue = get(value, primaryValueDataPath);
        const selectedOption = finalOptions?.value?.find((option) => {
            const optionPrimaryValue = get(option, primaryValueDataPath);

            return optionPrimaryValue === primaryValue;
        });

        return selectedOption || value;
    }

    handleSelectValue(value: unknown[] | Record<string, unknown> | unknown | null) {
        if (value === null || value === undefined) return value;

        // handle primitive value
        if (typeof value !== 'object') {
            return value;
        }

        // handle array
        if (Array.isArray(value)) {
            return this.handleAndGetSelectValueAsArray(value);
        }

        return this.handleAndGetSelectValueAsObject(value as Record<string, unknown>);
    }

    handleSelectInitialValue() {
        const valueFromSource = get(this.#globalService.getSource()(), this.field.path);

        console.log({ valueFromSource });

        const finalValue = this.handleSelectValue(valueFromSource);

        this.formControl.setValue(finalValue);
    }

    getValueByPath(path: string | undefined, source: unknown[] | Record<string, unknown> | unknown) {
        if (!path) return source;

        if (!source) return source;

        if (typeof source !== 'object') return source;

        return get(source as unknown[] | Record<string, unknown>, path);
    }

    isAnObjectExcludeNull(input: unknown) {
        if (input === null) return false;

        return typeof input === 'object';
    }

    // end: specific to select -----------------------

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
