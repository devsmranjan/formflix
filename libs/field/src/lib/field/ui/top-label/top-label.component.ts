import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'formflix-top-label',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './top-label.component.html',
    styleUrl: './top-label.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopLabelComponent {
    @Input({ required: true }) message!: string;
    @Input() showRequiredSymbol = false;
}
