import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';

import { GlobalService, TFieldZod, getFromJson } from '@formflix/utils';

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

    #globalService = inject(GlobalService);

    show = signal(false);

    getValue(path: string) {
        return getFromJson(path, this.#globalService.source);
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.show.set(true);
        }, 500);
    }
}
