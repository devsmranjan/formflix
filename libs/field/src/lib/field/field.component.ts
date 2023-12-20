import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { GlobalService, TField, getFromJson } from '@formflix/utils';

import { TextareaComponent, TextfieldComponent } from './containers';
import { Textfield2Component } from './containers/textfield2/textfield2.component';

@Component({
    selector: 'formflix-field',
    standalone: true,
    imports: [CommonModule, TextfieldComponent, TextareaComponent, Textfield2Component],
    templateUrl: './field.component.html',
    styleUrl: './field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent {
    @Input({ required: true }) field!: TField;

    #globalService = inject(GlobalService);

    getValue(path: string) {
        return getFromJson(path, this.#globalService.source);
    }
}
