import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'formflix-field',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './field.component.html',
    styleUrl: './field.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent {}
