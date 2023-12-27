import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FieldComponent } from '@formflix/field';
import { SectionComponent } from '@formflix/section';
import { SubsectionComponent } from '@formflix/subsection';
import { FieldValidatorService, GlobalService, TTemplate, setToJson } from '@formflix/utils';

@Component({
    standalone: true,
    imports: [RouterModule, FieldComponent, SubsectionComponent, SectionComponent],
    selector: 'formflix-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [GlobalService, FieldValidatorService],
})
export class AppComponent implements OnInit {
    globalService = inject(GlobalService);

    template: Partial<TTemplate> = {
        label: 'Form',
        sections: {
            1: {
                id: 1,
                label: 'Section 1',
                subsections: {
                    2: {
                        id: 2,
                        sectionId: 1,
                        label: 'Subsection 1',
                        fields: {
                            3: {
                                id: 3,
                                sectionId: 1,
                                subsectionId: 2,
                                name: 'Field A',
                                label: 'Field A: B + C',
                                tag: 'input',
                                type: 'number',
                                path: '$.data.field_a',
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
                                valueDependsOn: [5, 6],
                                disable: {
                                    dataMap: {
                                        FIELD_C: {
                                            query: '$.data.field_c',
                                        },
                                    },
                                    expression: '{FIELD_C} === 100',
                                },
                                disableDependsOn: [6],
                            },
                        },
                    },
                    4: {
                        id: 4,
                        sectionId: 1,
                        label: 'Subsection 2',
                        fields: {
                            5: {
                                id: 5,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field B',
                                label: 'Field B: C * 2',
                                tag: 'input',
                                type: 'number',
                                path: '$.data.field_b',
                                // value: {
                                //     dataMap: {
                                //         FIELD_C: {
                                //             query: '$.data.field_c',
                                //         },
                                //     },
                                //     expression: '{FIELD_C} * 2',
                                // },
                                // valueDependsOn: [6],
                                // disable: {
                                //     dataMap: {
                                //         FIELD_B: {
                                //             query: '$.data.field_b',
                                //         },
                                //     },
                                //     expression: '{FIELD_B} === 5',
                                // },
                                // disableDependsOn: [5],
                                // you can add your own id, because disable will not gonna trigger it;s
                                // dependents again in 2nd iteration.
                                readonly: true,
                            },
                            6: {
                                id: 6,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field C',
                                label: 'Field C: {FIELD_D} * 2',
                                tag: 'input',
                                type: 'number',
                                path: '$.data.field_c',
                                value: {
                                    dataMap: {
                                        FIELD_D: {
                                            query: '$.data.field_d',
                                        },
                                    },
                                    expression: '{FIELD_D} * 2',
                                },
                                valueDependsOn: [7],
                            },
                            7: {
                                id: 7,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field D',
                                label: 'Field D: E * 3',
                                tag: 'input',
                                type: 'number',
                                path: '$.data.field_d',
                                hint: 'field d hint',
                                value: {
                                    dataMap: {
                                        FIELD_E: {
                                            query: '$.data.field_e',
                                        },
                                    },
                                    expression: '{FIELD_E} * 3',
                                },
                                valueDependsOn: [8],
                                hide: {
                                    dataMap: {
                                        FIELD_E: {
                                            query: '$.data.field_e',
                                        },
                                    },
                                    expression: '{FIELD_E} === 100',
                                },
                                hideDependsOn: [8],
                                validators: [
                                    {
                                        type: 'REQUIRED',
                                        message: 'Field D is required',
                                        condition: {
                                            dataMap: {
                                                FIELD_E: {
                                                    query: '$.data.field_e',
                                                },
                                            },
                                            expression: '{FIELD_E} === 200',
                                        },
                                    },
                                    {
                                        type: 'PATTERN',
                                        value: '^.{6}$|^.{8}$',
                                        message: 'Field D can have only 6 or 8 chracters',
                                    },
                                    {
                                        type: 'MIN',
                                        value: 100001,
                                        message: 'Field D should have minimum 100001',
                                    },
                                ],
                                validatorsDependsOn: [8],
                            },
                            8: {
                                id: 8,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field E',
                                label: 'Field E',
                                tag: 'input',
                                type: 'number',
                                path: '$.data.field_e',
                            },
                            // 9: {
                            //     id: 9,
                            //     sectionId: 1,
                            //     subsectionId: 4,
                            //     name: 'Field F: {ALL_PRICE} * 2',
                            //     label: 'Field F',
                            //     path: '$.data.field_e',
                            // },
                        },
                    },
                },
            },
        },
    };

    source = {
        data: {
            field_a: 2,
            field_b: 5,
            field_c: 100,
            field_d: undefined,
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

    ngOnInit(): void {
        console.log('App initiated');

        this.globalService.setSource(this.source);
        this.globalService.setTemplate(this.template);
    }

    getSections() {
        return this.globalService.getSections();
    }

    updateSource() {
        setToJson('$.data.field_c', this.source, 100);
    }

    updateAllFieldsSilently() {
        this.globalService.updateAllFieldValueFromSource();
    }
}
