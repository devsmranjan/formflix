import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SectionComponent } from '@formflix/section';
import { GlobalService } from '@formflix/utils';

@Component({
    selector: 'formflix-generated-form',
    standalone: true,
    imports: [CommonModule, SectionComponent],
    templateUrl: './generated-form.component.html',
    styleUrl: './generated-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneratedFormComponent {
    globalService = inject(GlobalService);

    printSource() {
        console.log(this.globalService.getSource()());
    }
}
