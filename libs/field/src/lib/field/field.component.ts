import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';

import { GlobalService, TField } from '@formflix/utils';

import { get } from 'lodash-es';

import { SelectComponent, TextareaComponent, TextfieldComponent } from './containers';

@Component({
    selector: 'formflix-field',
    standalone: true,
    imports: [CommonModule, TextfieldComponent, TextareaComponent, SelectComponent],
    templateUrl: './field.component.html',
    styleUrl: './field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent implements OnInit {
    @Input({ required: true }) field!: TField;

    #globalService = inject(GlobalService);

    getValue(path: string) {
        console.log({
            source: this.#globalService.getSource()(),
        });
        return get(this.#globalService.getSource()(), path);
    }

    ngOnInit(): void {
        console.log(this.field);
    }
}
