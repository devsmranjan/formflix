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
            label: 'Field A: B + C',
            name: 'FIELD_A',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.data.field_a',
            dependsOn: ['2', 3],
            value: {
                dataMap: {
                    FIELD_B: {
                        query: '$.data.field_b',
                    },
                    FIELD_C: {
                        query: '$.data.field_c',
                    },
                },
                expression: '{FIELD_B} + {FIELD_C}',
            },
            calculateValueInitially: true,
            disable: {
                dataMap: {
                    FIELD_C: {
                        query: '$.data.field_c',
                    },
                },
                expression: '{FIELD_C} === 100',
            },
        },
        {
            id: '2',
            label: 'Field B: C * 2',
            name: 'FIELD_B',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.data.field_b',
            // dependsOn: [3],
            // value: {
            //     dataMap: {
            //         FIELD_C: {
            //             query: '$.data.field_c',
            //         },
            //     },
            //     expression: '{FIELD_C} * 2',
            // },
            // calculateValueInitially: true,
            readonly: true,
        },
        {
            id: 3,
            label: 'Field C: {FIELD_D} * 2',
            name: 'FIELD_C',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.data.field_c',
            dependsOn: [4],
            value: {
                dataMap: {
                    FIELD_D: {
                        query: '$.data.field_d',
                    },
                },
                expression: '{FIELD_D} * 2',
            },
            calculateValueInitially: true,
        },
        {
            id: 4,
            label: 'Field D: E * 3',
            name: 'FIELD_D',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.data.field_d',
            dependsOn: [5],
            value: {
                dataMap: {
                    FIELD_E: {
                        query: '$.data.field_e',
                    },
                },
                expression: '{FIELD_E} * 3',
            },
            calculateValueInitially: true,
        },
        {
            id: 5,
            label: 'Field E',
            name: 'FIELD_E',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.data.field_e',
        },
        {
            id: 6,
            label: 'Field F: {ALL_PRICE} * 2',
            name: 'FIELD_F',
            tag: EFieldTag.Input,
            type: 'number',
            path: '$.data.field_e',
            value: {
                dataMap: {
                    ALL_PRICE: {
                        query: '$.data..price',
                        fn: 'SUM',
                    },
                },
                expression: '{ALL_PRICE} * 2',
            },
            calculateValueInitially: true,
        },
    ];

    ngOnInit(): void {
        this.globalService.source = {
            data: {
                field_a: 2,
                field_b: 5,
                field_c: 2,
                field_d: 5,
                field_e: 4,
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

        this.globalService.fields = this.fields;
    }
}
