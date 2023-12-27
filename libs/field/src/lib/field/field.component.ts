import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';

import { GlobalService, TField, getFromJson } from '@formflix/utils';

import { TextareaComponent, TextfieldComponent } from './containers';

@Component({
    selector: 'formflix-field',
    standalone: true,
    imports: [CommonModule, TextfieldComponent, TextareaComponent],
    templateUrl: './field.component.html',
    styleUrl: './field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent implements OnInit {
    @Input({ required: true }) field!: TField;

    #globalService = inject(GlobalService);

    getValue(path: string) {
        return getFromJson(path, this.#globalService.getSource()());
    }

    ngOnInit(): void {
        console.log(this.field);
    }
}
