import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { cn } from '@formflix/utils';

@Component({
    selector: 'formflix-bottom-label',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bottom-label.component.html',
    styleUrl: './bottom-label.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomLabelComponent {
    _cn = cn;

    @Input({ required: true }) message!: string;
    @Input() colorClass = '';
}
