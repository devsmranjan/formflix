import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { GlobalService } from '@formflix/utils';

import { JsonEditorOptions, NgJsonEditorModule } from 'ang-jsoneditor';
import { debounce } from 'lodash-es';

@Component({
    selector: 'formflix-json-editor',
    standalone: true,
    imports: [CommonModule, NgJsonEditorModule],
    templateUrl: './json-editor.component.html',
    styleUrl: './json-editor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonEditorComponent implements OnInit {
    #globalService = inject(GlobalService);

    editorOptions = new JsonEditorOptions();
    data = {
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
                                tag: 'INPUT',
                                type: 'number',
                                path: 'data.field_a',
                                value: {
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
                                    dependsOn: [5, 6],
                                },
                                disable: {
                                    value: {
                                        dataMap: {
                                            FIELD_C: {
                                                query: '$.data.field_c',
                                            },
                                        },
                                        expression: '{FIELD_C} === 100',
                                    },
                                    dependsOn: [6],
                                },
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
                                tag: 'INPUT',
                                type: 'number',
                                path: 'data.field_b',
                                // value: {
                                //     value: {
                                //         dataMap: {
                                //             FIELD_C: {
                                //                 query: '$.data.field_c',
                                //             },
                                //         },
                                //         expression: '{FIELD_C} * 2',
                                //     }
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
                                tag: 'INPUT',
                                type: 'number',
                                path: 'data.field_c',
                                value: {
                                    value: {
                                        dataMap: {
                                            FIELD_D: {
                                                query: '$.data.field_d',
                                            },
                                        },
                                        expression: '{FIELD_D} * 2',
                                    },
                                    dependsOn: [7],
                                },
                            },
                            7: {
                                id: 7,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field D',
                                label: 'Field D: E * 3',
                                tag: 'INPUT',
                                type: 'number',
                                path: 'data.field_d',
                                hint: 'field d hint',
                                value: {
                                    value: {
                                        dataMap: {
                                            FIELD_E: {
                                                query: '$.data.field_e',
                                            },
                                        },
                                        expression: '{FIELD_E} * 3',
                                    },
                                    dependsOn: [8],
                                },
                                hide: {
                                    value: {
                                        dataMap: {
                                            FIELD_E: {
                                                query: '$.data.field_e',
                                            },
                                        },
                                        expression: '{FIELD_E} === 100',
                                    },
                                    dependsOn: [8],
                                },
                                validators: {
                                    value: [
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
                                    dependsOn: [8],
                                },
                            },
                            8: {
                                id: 8,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field E',
                                label: 'Field E',
                                tag: 'INPUT',
                                type: 'number',
                                path: 'data.field_e',
                            },
                            // 9: {
                            //     id: 9,
                            //     sectionId: 1,
                            //     subsectionId: 4,
                            //     name: 'Field F: {ALL_PRICE} * 2',
                            //     label: 'Field F',
                            //     path: '$.data.field_e',
                            // },
                            9: {
                                id: 9,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field F',
                                label: 'Field F',
                                tag: 'TEXTAREA',
                                path: 'data.field_f',
                                hint: 'field f hint',
                                validators: {
                                    value: [
                                        {
                                            type: 'REQUIRED',
                                            message: 'Field F is required',
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
                                            message: 'Field F can have only 6 or 8 chracters',
                                        },
                                        {
                                            type: 'MIN',
                                            value: 100001,
                                            message: 'Field F should have minimum 100001',
                                        },
                                    ],
                                    dependsOn: [8],
                                },
                            },
                            10: {
                                id: 10,
                                sectionId: 1,
                                subsectionId: 4,
                                name: 'Field G',
                                label: 'Field G',
                                tag: 'SELECT',
                                path: 'data.field_g',
                                hint: 'field g hint',
                                options: {
                                    value: [
                                        {
                                            label1: 'Option 1',
                                            label2: 'Label 2',
                                            label3: 'Label 3',
                                        },
                                        {
                                            label1: 'Option 2',
                                            label2: 'Label 2',
                                            label3: 'Label 3',
                                        },
                                        {
                                            label1: 'Option 3',
                                            label2: 'Label 2',
                                            label3: 'Label 3',
                                        },
                                    ],
                                    dataPaths: {
                                        primary: 'label1',
                                        secondary: ['label2', 'label3'],
                                    },
                                    multiple: true,
                                },
                                // options:

                                // optionsConfig: {
                                //     primaryValueDataPath: 'label1',
                                //     // secondaryValueDataPaths: ['label2', 'label3'],
                                //     // multiple: true,
                                // },
                                // TODO: Handle default value
                                // defaultValue: {
                                //     label1: 'Option 1',
                                //     label2: 'Label 2',
                                //     label3: 'Label 3',
                                // },
                                // validators: [
                                //     {
                                //         type: 'REQUIRED',
                                //         message: 'Field F is required',
                                //         condition: {
                                //             dataMap: {
                                //                 FIELD_E: {
                                //                     query: '$.data.field_e',
                                //                 },
                                //             },
                                //             expression: '{FIELD_E} === 200',
                                //         },
                                //     },
                                //     {
                                //         type: 'PATTERN',
                                //         value: '^.{6}$|^.{8}$',
                                //         message: 'Field F can have only 6 or 8 chracters',
                                //     },
                                //     {
                                //         type: 'MIN',
                                //         value: 100001,
                                //         message: 'Field F should have minimum 100001',
                                //     },
                                // ],
                                // validatorsDependsOn: [8],
                            },
                        },
                    },
                },
            },
        },
    };

    constructor() {
        this.editorOptions.mode = 'code';
    }

    ngOnInit(): void {
        this.#globalService.setTemplate(this.data);
    }

    updateTemplate = debounce((json: unknown) => {
        if (json instanceof Event) return;

        this.#globalService.setTemplate(json);
    }, 500);
}
