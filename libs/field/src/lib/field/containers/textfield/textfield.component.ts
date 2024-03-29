import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { GlobalService, TField, setToJson } from '@formflix/utils';

import { Subject, takeUntil } from 'rxjs';

import { BottomLabelComponent, TopLabelComponent } from '../../ui';

@Component({
    selector: 'formflix-textfield',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TopLabelComponent, BottomLabelComponent],
    templateUrl: './textfield.component.html',
    styleUrl: './textfield.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextfieldComponent implements OnInit, OnDestroy {
    @Input({ required: true }) field!: TField;

    #globalService = inject(GlobalService);
    #changeDetectorRef = inject(ChangeDetectorRef);

    formControl!: FormControl;
    currentValueTrigger$!: Subject<symbol> | undefined;
    currentDisableTrigger$!: Subject<symbol> | undefined;
    currentValidatorTrigger$!: Subject<symbol> | undefined;

    destroy$ = new Subject<void>();

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
        setToJson(this.#globalService.getSource()(), this.field.path, value);
    }

    handleFormValue(value: unknown) {
        // TODO: Convert to number if field type is number
        this.updateSource(value);
        this.#globalService.triggerDependencies(this.field);
    }

    handleFormInput() {
        this.handleFormValue(this.formControl.value);
    }

    hasRequiredValidator() {
        return this.#globalService.fieldValidator.hasRequiredValidator(this.formControl);
    }

    getErrorMessages() {
        return this.#globalService.fieldValidator.getErrorMessages(this.field, this.formControl);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
/**
 * Custoom validator
 * Strong type check
 * input type variable
 * Refactor duplicate code
 * Textarea, date field, select etc.
 * Autocomplete
 * API integration feature
 * Refcator
 * UI
 */
