import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { TField } from '@formflix/utils';

@Component({
    selector: 'formflix-textfield',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './textfield.component.html',
    styleUrl: './textfield.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextfieldComponent {
    @Input({ required: true }) field!: TField;

    error = signal<string | null>(null);
}
