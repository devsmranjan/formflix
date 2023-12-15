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

    field: TField = {
        id: 1,
        label: 'Invoice Number',
        name: 'INVOICE_NUMBER',
        tag: EFieldTag.Input,
        type: 'text',
        path: '$.invoice.invoiceNo',
        required: true,
        hint: 'Name should be atleast of 5 characters',
        readonly: false,
        defaultValue: '0000',
    };

    ngOnInit(): void {
        this.globalService.source = {
            invoice: {
                id: 1212,
                invoiceNo: '12563451625',
                status: 'pending',
            },
        };

        this.globalService.fields = [this.field];
    }
}
