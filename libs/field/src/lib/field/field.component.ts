import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TField } from '@formflix/utils';

import { TextareaComponent, TextfieldComponent } from './containers';

@Component({
    selector: 'formflix-field',
    standalone: true,
    imports: [CommonModule, TextfieldComponent, TextareaComponent],
    templateUrl: './field.component.html',
    styleUrl: './field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent {
    @Input({ required: true }) field!: TField;
}
