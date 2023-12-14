import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'formflix-subsection',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './subsection.component.html',
    styleUrl: './subsection.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubsectionComponent {}
