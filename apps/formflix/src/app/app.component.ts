import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FieldComponent } from '@formflix/field';
import { SectionComponent } from '@formflix/section';
import { SubsectionComponent } from '@formflix/subsection';
import { Global2Service, GlobalService, TTemplateZod, setToJson } from '@formflix/utils';

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

    // fields: TField[] = [
    //     {
    //         id: 1,
    //         label: 'Field A: B + C',
    //         name: 'FIELD_A',
    //         tag: EFieldTag.Input,
    //         type: 'number',
    //         path: '$.data.field_a',
    //         dependsOn: ['2', 3],
    //         value: {
    //             dataMap: {
    //                 FIELD_B: {
    //                     query: '$.data.field_b',
    //                 },
    //                 FIELD_C: {
    //                     query: '$.data.field_c',
    //                 },
    //             },
    //             expression: '{FIELD_B} + {FIELD_C}',
    //         },
    //         calculateValueInitially: true,
    //         disable: {
    //             dataMap: {
    //                 FIELD_C: {
    //                     query: '$.data.field_c',
    //                 },
    //             },
    //             expression: '{FIELD_C} === 100',
    //         },
    //     },
    //     {
    //         id: '2',
    //         label: 'Field B: C * 2',
    //         name: 'FIELD_B',
    //         tag: EFieldTag.Input,
    //         type: 'number',
    //         path: '$.data.field_b',
    //         // dependsOn: [3],
    //         // value: {
    //         //     dataMap: {
    //         //         FIELD_C: {
    //         //             query: '$.data.field_c',
    //         //         },
    //         //     },
    //         //     expression: '{FIELD_C} * 2',
    //         // },
    //         // calculateValueInitially: true,
    //         readonly: true,
    //     },
    //     {
    //         id: 3,
    //         label: 'Field C: {FIELD_D} * 2',
    //         name: 'FIELD_C',
    //         tag: EFieldTag.Input,
    //         type: 'number',
    //         path: '$.data.field_c',
    //         dependsOn: [4],
    //         value: {
    //             dataMap: {
    //                 FIELD_D: {
    //                     query: '$.data.field_d',
    //                 },
    //             },
    //             expression: '{FIELD_D} * 2',
    //         },
    //         calculateValueInitially: true,
    //     },
    //     {
    //         id: 4,
    //         label: 'Field D: E * 3',
    //         name: 'FIELD_D',
    //         tag: EFieldTag.Input,
    //         type: 'number',
    //         path: '$.data.field_d',
    //         dependsOn: [5],
    //         value: {
    //             dataMap: {
    //                 FIELD_E: {
    //                     query: '$.data.field_e',
    //                 },
    //             },
    //             expression: '{FIELD_E} * 3',
    //         },
    //         calculateValueInitially: true,
    //     },
    //     {
    //         id: 5,
    //         label: 'Field E',
    //         name: 'FIELD_E',
    //         tag: EFieldTag.Input,
    //         type: 'number',
    //         path: '$.data.field_e',
    //     },
    //     {
    //         id: 6,
    //         label: 'Field F: {ALL_PRICE} * 2',
    //         name: 'FIELD_F',
    //         tag: EFieldTag.Input,
    //         type: 'number',
    //         path: '$.data.field_e',
    //         value: {
    //             dataMap: {
    //                 ALL_PRICE: {
    //                     query: '$.data..price',
    //                     fn: 'SUM',
    //                 },
    //             },
    //             expression: '{ALL_PRICE} * 2',
    //         },
    //         calculateValueInitially: true,
    //     },
    // ];

    template: Partial<TTemplateZod> = {
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
                                path: '$.data.field_b',
                                value: {
                                    dataMap: {
                                        FIELD_C: {
                                            query: '$.data.field_c',
                                        },
                                    },
                                    expression: '{FIELD_C} * 2',
                                },
                                valueDependsOn: [6],
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
                                // But donot do that, other wise it might happen, you will not gonna able to change
                                readonly: true,
                            },
                            6: {
                                id: 6,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field C',
                                label: 'Field C: {FIELD_D} * 2',
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
                                path: '$.data.field_d',
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
                                    expression: '{FIELD_E} == 100',
                                },
                                showDependsOn: [8],
                            },
                            8: {
                                id: 8,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field E',
                                label: 'Field E',
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

    ngOnInit(): void {
        console.log('App initiated');

        this.global2Service.setSource(this.source);
        this.global2Service.setTemplate(this.template);
    }

    getSections() {
        return this.global2Service.getSections();
    }

    updateSource() {
        setToJson('$.data.field_c', this.source, 100);
    }

    updateAllFieldsSilently() {
        this.global2Service.updateAllFieldValueFromSource();
    }
}
