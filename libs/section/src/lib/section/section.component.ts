import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { SubsectionComponent } from '@formflix/subsection';
import { Global2Service, TSectionZod } from '@formflix/utils';

@Component({
    selector: 'formflix-section',
    standalone: true,
    imports: [CommonModule, SubsectionComponent],
    templateUrl: './section.component.html',
    styleUrl: './section.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionComponent {
    #globalService = inject(Global2Service);

    @Input({ required: true }) section!: TSectionZod;

    getSubsections() {
        return this.#globalService.getSubsections(this.section.id);
    }
}
