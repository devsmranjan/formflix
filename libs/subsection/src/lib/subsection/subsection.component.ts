import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { FieldComponent } from '@formflix/field';
import { Global2Service, TSubsectionZod } from '@formflix/utils';

@Component({
    selector: 'formflix-subsection',
    standalone: true,
    imports: [CommonModule, FieldComponent],
    templateUrl: './subsection.component.html',
    styleUrl: './subsection.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubsectionComponent {
    global2Service = inject(Global2Service);

    @Input({ required: true }) subsection!: TSubsectionZod;

    getFields() {
        return this.global2Service.getFields(this.subsection.id, this.subsection.sectionId);
    }
}
