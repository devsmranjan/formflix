import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FieldComponent } from '@formflix/field';
import { GlobalService } from '@formflix/utils';

@Component({
    selector: 'formflix-subsection',
    standalone: true,
    imports: [CommonModule, FieldComponent],
    templateUrl: './subsection.component.html',
    styleUrl: './subsection.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubsectionComponent {
    globalService = inject(GlobalService);
}
