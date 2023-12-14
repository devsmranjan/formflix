import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'formflix-section',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './section.component.html',
    styleUrl: './section.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionComponent {}
