import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FieldComponent } from '@formflix/field';
import { SectionComponent } from '@formflix/section';
import { SubsectionComponent } from '@formflix/subsection';
import { EFieldTag, Global2Service, GlobalService, TField, TTemplateZod } from '@formflix/utils';

@Component({
    standalone: true,
    imports: [RouterModule, FieldComponent, SubsectionComponent, SectionComponent],
    selector: 'formflix-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [GlobalService, Global2Service],
})
export class AppComponent implements OnInit {
    // globalService = inject(GlobalService);

    global2Service = inject(Global2Service);

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

    template: Partial<TTemplateZod> = {
        label: 'Form',
        sections: {
            1111: {
                id: 1111,
                label: 'Section 1',
                subsections: {
                    2222: {
                        id: 2222,
                        sectionId: 1111,
                        label: 'Subsection 1',
                        fields: {
                            3333: {
                                id: 3333,
                                sectionId: 1111,
                                subsectionId: 2222,
                                name: 'Field 1',
                                label: 'Field 1',
                            },
                        },
                    },
                    4444: {
                        id: 4444,
                        sectionId: 1111,
                        label: 'Subsection 2',
                        fields: {
                            5555: {
                                id: 5555,
                                sectionId: 1111,
                                subsectionId: 4444,
                                name: 'Field 1',
                                label: 'Field 1',
                            },
                        },
                    },
                },
            },
        },
    };

    ngOnInit(): void {
        console.log('App initiated');
        this.global2Service.setTemplate(this.template);

        const source = {
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

        this.global2Service.setSource(source);
    }

    getSections() {
        return this.global2Service.getSections();
    }
}
