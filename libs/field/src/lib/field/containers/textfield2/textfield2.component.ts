import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'formflix-textfield2',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './textfield2.component.html',
    styleUrl: './textfield2.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Textfield2Component {}
