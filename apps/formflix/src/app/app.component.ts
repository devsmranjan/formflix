import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FieldComponent } from '@formflix/field';
import { SectionComponent } from '@formflix/section';
import { SubsectionComponent } from '@formflix/subsection';
import { TField } from '@formflix/utils';

@Component({
    standalone: true,
    imports: [RouterModule, FieldComponent, SubsectionComponent, SectionComponent],
    selector: 'formflix-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    field: TField = {
        id: 1,
        label: 'Invoice Number',
        name: 'INVOICE_NUMBER',
        tag: 'input',
        type: 'text',
        path: 'invoiceNumber',
        required: true,
        hint: 'Name should be atleast of 5 characters',
        readonly: false,
    };
}
