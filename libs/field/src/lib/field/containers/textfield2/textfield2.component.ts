import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Global2Service, TFieldZod } from '@formflix/utils';

@Component({
    selector: 'formflix-textfield2',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './textfield2.component.html',
    styleUrl: './textfield2.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Textfield2Component implements OnInit {
    @Input({ required: true }) field!: TFieldZod;

    #global2Service = inject(Global2Service);

    formControl!: FormControl;

    ngOnInit(): void {
        this.formControl = this.#global2Service.getFieldFormRef(
            this.field.id,
            this.field.subsectionId,
            this.field.sectionId,
        );
    }
}
