import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';

import { Global2Service, TFieldZod, getFromJson } from '@formflix/utils';

import { TextareaComponent, TextfieldComponent } from './containers';
import { Textfield2Component } from './containers/textfield2/textfield2.component';

@Component({
    selector: 'formflix-field',
    standalone: true,
    imports: [CommonModule, TextfieldComponent, TextareaComponent, Textfield2Component],
    templateUrl: './field.component.html',
    styleUrl: './field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent implements OnInit {
    @Input({ required: true }) field!: TFieldZod;

    #global2Service = inject(Global2Service);

    getValue(path: string) {
        return getFromJson(path, this.#global2Service.getSource()());
    }

    ngOnInit(): void {
        console.log(this.field);
    }
}
