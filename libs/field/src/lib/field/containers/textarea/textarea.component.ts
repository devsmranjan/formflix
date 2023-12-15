import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { TTextareaField } from '@formflix/utils';

import { BottomLabelComponent, TopLabelComponent } from '../../ui';

@Component({
    selector: 'formflix-textarea',
    standalone: true,
    imports: [CommonModule, BottomLabelComponent, TopLabelComponent],
    templateUrl: './textarea.component.html',
    styleUrl: './textarea.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent {
    @Input({ required: true }) field!: TTextareaField;

    error = signal<string | null>(null);
}
