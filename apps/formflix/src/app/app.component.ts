import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FieldComponent } from '@formflix/field';
import { SectionComponent } from '@formflix/section';
import { SubsectionComponent } from '@formflix/subsection';
import { EFieldTag, GlobalService, TField } from '@formflix/utils';

@Component({
    standalone: true,
    imports: [RouterModule, FieldComponent, SubsectionComponent, SectionComponent],
    selector: 'formflix-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [GlobalService],
})
export class AppComponent implements OnInit {
    globalService = inject(GlobalService);

    fields: TField[] = [
        {
            id: 1,
            label: 'Label A',
            name: 'LABEL_A',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.invoice.a',
            required: true,
            hint: 'Name should be atleast of 5 characters',
            readonly: false,
            defaultValue: '0000',
        },
        {
            id: 2,
            label: 'Label B',
            name: 'LABEL_B',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.invoice.b',
            required: true,
            hint: 'Name should be atleast of 5 characters',
            readonly: false,
            defaultValue: '0000',
        },
        {
            id: 3,
            label: 'Label C',
            name: 'LABEL_C',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.invoice.c',
            required: true,
            hint: 'Name should be atleast of 5 characters',
            readonly: false,
            defaultValue: '0000',
        },
    ];

    ngOnInit(): void {
        this.globalService.source = {
            invoice: {
                a: 10,
                b: 20,
                c: 30,
            },
        };

        this.globalService.fields = this.fields;
    }
}
