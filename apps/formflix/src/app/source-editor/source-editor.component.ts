import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { GlobalService } from '@formflix/utils';

import { JsonEditorOptions, NgJsonEditorModule } from 'ang-jsoneditor';
import { debounce } from 'lodash-es';

@Component({
    selector: 'formflix-source-editor',
    standalone: true,
    imports: [CommonModule, NgJsonEditorModule],
    templateUrl: './source-editor.component.html',
    styleUrl: './source-editor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceEditorComponent {
    globalService = inject(GlobalService);

    @Input({ required: true }) source!: Record<string, unknown> | unknown[] | null;

    editorOptions = new JsonEditorOptions();

    constructor() {
        this.editorOptions.mode = 'code';
    }

    updateSource = debounce((json: Record<string, unknown> | unknown[] | null) => {
        if (json instanceof Event) return;

        this.globalService.setSource(json);
        this.globalService.setTemplate(this.globalService.template());
    }, 500);
}
