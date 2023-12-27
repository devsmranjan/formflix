import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { TId } from '../../schemas';

@Injectable()
export class FormDisableService {
    #getFieldFormRef(form: FormGroup, fieldId: TId, subsectionId: TId, sectionId: TId) {
        return form?.get(`${sectionId}`)?.get(`${subsectionId}`)?.get(`${fieldId}`) as FormControl;
    }

    #getSubsectionFormRef(form: FormGroup, subsectionId: TId, sectionId: TId) {
        return form?.get(`${sectionId}`)?.get(`${subsectionId}`) as FormGroup;
    }

    #getSectionFormRef(form: FormGroup, sectionId: TId) {
        return form?.get(`${sectionId}`) as FormGroup;
    }

    disableField(value: boolean, form: FormGroup | null, fieldId: TId, subsectionId: TId, sectionId: TId) {
        if (!form) return;

        const formControl = this.#getFieldFormRef(form, fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (value) {
            formControl.disable();
        } else {
            formControl.enable();
        }
    }

    disableSubsection(value: boolean, form: FormGroup | null, subsectionId: TId, sectionId: TId) {
        if (!form) return;

        const formGroup = this.#getSubsectionFormRef(form, subsectionId, sectionId);

        if (!formGroup) return;

        if (value) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }

    disableSection(value: boolean, form: FormGroup | null, sectionId: TId) {
        if (!form) return;

        const formGroup = this.#getSectionFormRef(form, sectionId);

        if (!formGroup) return;

        if (value) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }

    disableForm(value: boolean, form: FormGroup | null) {
        if (!form) return;

        const formGroup = form;

        if (!formGroup) return;

        if (value) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }
}
