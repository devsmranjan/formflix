import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TField } from '@formflix/utils';

import { TextfieldComponent } from './containers';

@Component({
    selector: 'formflix-field',
    standalone: true,
    imports: [CommonModule, TextfieldComponent],
    templateUrl: './field.component.html',
    styleUrl: './field.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent {
    @Input({ required: true }) field!: TField;
}
