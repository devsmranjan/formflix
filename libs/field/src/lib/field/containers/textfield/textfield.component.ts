import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { GlobalService, TInputField, getFromJson, setToJson } from '@formflix/utils';

import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { BottomLabelComponent, TopLabelComponent } from '../../ui';

@Component({
    selector: 'formflix-textfield',
    standalone: true,
    imports: [CommonModule, BottomLabelComponent, TopLabelComponent, ReactiveFormsModule],
    templateUrl: './textfield.component.html',
    styleUrl: './textfield.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextfieldComponent implements OnInit, OnDestroy {
    @Input({ required: true }) field!: TInputField;

    #globalService = inject(GlobalService);

    formControl = new FormControl();
    error = signal<string | null>(null);

    destroy$ = new Subject<void>();

    ngOnInit(): void {
        console.log('text field component, field:', this.field);

        // set initial value
        this.setInitalValue();

        // handle form value change
        this.handleFormValueChange();
    }

    setInitalValue() {
        const { source } = this.#globalService;

        console.log({ source });

        if (!source) return;

        let value = getFromJson(this.field.path, source);

        if (value === undefined) {
            // handle default value
            value = this.field.defaultValue !== undefined ? this.field.defaultValue : value;
        }

        console.log('text field component, initial value:', value, value === undefined);

        // set value
        setToJson(this.field.path, source, value);

        // update in form control
        this.formControl.setValue(value);
    }

    handleFormValueChange() {
        this.formControl.valueChanges
            .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((value) => {
                console.log('form contol value', value);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
