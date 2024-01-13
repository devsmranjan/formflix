import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FieldComponent } from '@formflix/field';
import { SectionComponent } from '@formflix/section';
import { SubsectionComponent } from '@formflix/subsection';
import { ConditionService, FieldValidatorService, FormDisableService, GlobalService } from '@formflix/utils';

import { GeneratedFormComponent } from './generated-form/generated-form.component';
import { JsonEditorComponent } from './json-editor/json-editor.component';

@Component({
    standalone: true,
    imports: [
        RouterModule,
        FieldComponent,
        SubsectionComponent,
        SectionComponent,
        JsonEditorComponent,
        GeneratedFormComponent,
    ],
    selector: 'formflix-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [GlobalService, FieldValidatorService, ConditionService, FormDisableService],
})
export class AppComponent implements OnInit {
    globalService = inject(GlobalService);

    source = {
        data: {
            field_a: 2,
            field_b: 5,
            field_c: 100,
            field_d: undefined,
            field_e: 4,
            field_f: 5,
            // field_g: undefined,
            // [
            //     // {
            //     //     label1: 'Option 2',
            //     //     label2: 'Label 2',
            //     //     label3: 'Label 3',
            //     // },
            //     // {
            //     //     label1: 'Option 1',
            //     //     label2: 'Label 2',
            //     //     label3: 'Label 3',
            //     // },
            //     {
            //         label1: 'Option 1',
            //         label2: 'Label 2',
            //         label3: 'Label 3',
            //     },
            //     'Option 4',
            //     'Option 5',
            // ]

            // {
            //     label1: 'Option 1',
            //     label2: 'Label 2',
            //     label3: 'Label 3',
            // },
            a: {
                price: 1,
                b: {
                    price: 2,
                    c: {
                        price: null,
                    },
                },
            },
        },
    };

    ngOnInit(): void {
        console.log('App initiated');

        this.globalService.setSource(this.source);
        // this.globalService.setTemplate(this.template);
    }

    updateSource() {
        // setToJson(this.source, '$.data.field_c', 100);
    }

    updateAllFieldsSilently() {
        this.globalService.updateAllFieldValueFromSource();
    }

    printSource() {
        // console.log({
        //     source: this.source,
        // });
    }
}
