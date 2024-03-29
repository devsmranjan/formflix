import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

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
export class JsonEditorComponent {
    globalService = inject(GlobalService);

    @Input({ required: true }) template!: unknown;

    editorOptions = new JsonEditorOptions();

    constructor() {
        this.editorOptions.mode = 'code';
    }

    updateTemplate = debounce((json: unknown) => {
        if (json instanceof Event) return;

        console.log({ template: json });

        this.globalService.setTemplate(json);
    }, 500);
}
