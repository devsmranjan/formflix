import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { TFieldZod, TIdZod, TSectionZod, TSubsectionZod, TTemplateZod, TemplateSchema } from '../schemas';

@Injectable()
export class Global2Service {
    #source = signal<Record<string, unknown> | unknown[] | null>(null);

    #template = signal<TTemplateZod | null>(null);
    #form: FormGroup | null = null;
    #fieldMap = new Map<string | number, TFieldZod>();

    // field
    #fieldDependentObserverMap = new Map<TIdZod, Subject<symbol>>();

    // field value
    #fieldValueDependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

    // source

    getSource() {
        return this.#source;
    }

    setSource(value: Record<string, unknown> | unknown[] | null) {
        this.#source.set(value);
    }

    // template

    getTemplate() {
        return this.#template;
    }

    setTemplate(value: Partial<TTemplateZod> | null) {
        try {
            const template = TemplateSchema.parse(value);

            console.log({ template });

            this.#template.set(template);

            this.#form = this.createFormFromTemplate(template);
            this.#fieldMap = this.createFieldMap(template);
            this.#fieldDependentObserverMap = this.createFieldDependentObserverMap(this.#fieldMap); // TODO: You should call this in a subsection component, so that when subsction is visible then only it will create (not create exactly, it should add or remove observables not replace) the observer

            this.#fieldValueDependentAndFieldMap = this.createFieldValueDependentAndFieldMap(this.#fieldMap);

            console.log('Global 2 template', this.#template());
            console.log('Global 2 form', this.#form);
            console.log('Global 2 fieldMap', this.#fieldMap);
            console.log('Global 2 fieldDependentObserverMap', this.#fieldDependentObserverMap);
            console.log('Global 2 fieldValueDependentAndFieldMap', this.#fieldValueDependentAndFieldMap);
        } catch (error) {
            console.error(error);
        }
    }

    // create field map
    createFieldMap(template: Partial<TTemplateZod>) {
        const fieldMap = new Map<string | number, TFieldZod>();

        try {
            const parsedValue = TemplateSchema.parse(template);

            const sections = parsedValue.sections;

            if (!sections) return fieldMap;

            Object.keys(sections).forEach((sectionKey) => {
                const section = sections[sectionKey];
                const subsections = section.subsections;

                if (!subsections) return;

                Object.keys(subsections).forEach((subsectionKey) => {
                    const subsection = subsections[subsectionKey];
                    const fields = subsection.fields;

                    if (!fields) return;

                    Object.keys(fields).forEach((fieldId) => {
                        const field = fields[fieldId];

                        fieldMap.set(fieldId, field);
                    });
                });
            });

            return fieldMap;
        } catch (error) {
            console.error(error);
        }

        return new Map<string | number, TFieldZod>();
    }

    // create observer for each field
    createFieldDependentObserverMap(fieldMap: Map<TIdZod, TFieldZod>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentObserverMap = new Map<TIdZod, Subject<symbol>>();

        fieldMap.forEach((field) => {
            dependentObserverMap.set(field.id, new Subject<symbol>());
        });

        return dependentObserverMap;
    }

    // create dependent & it's fields map, for field value
    createFieldValueDependentAndFieldMap(fieldMap: Map<TIdZod, TFieldZod>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

        fieldMap.forEach((field) => {
            // if (field.readonly) return;

            field?.valueDependsOn?.forEach((dependent) => {
                const fields = dependentAndFieldMap.get(dependent) ?? [];
                fields.push(field.id);
                dependentAndFieldMap.set(dependent, fields);
            });
        });

        return dependentAndFieldMap;
    }

    // start: form ------------------------------------------

    createFieldFormControl(field: TFieldZod) {
        return new FormControl(field.name);
    }

    createSubsectionFormGroup(subsection: TSubsectionZod) {
        const fieldControls = new Map<TIdZod | string, FormControl>();

        if (!subsection.fields) return new FormGroup(Object.fromEntries(fieldControls));

        Object.entries(subsection.fields).forEach(([id, field]) => {
            fieldControls.set(id, this.createFieldFormControl(field));
        });

        return new FormGroup(Object.fromEntries(fieldControls));
    }

    createSectionFormGroup(section: TSectionZod) {
        const subsectionGroups = new Map<TIdZod | string, FormGroup>();

        if (!section.subsections) return new FormGroup(Object.fromEntries(subsectionGroups));

        Object.entries(section.subsections).forEach(([id, subsection]) => {
            subsectionGroups.set(id, this.createSubsectionFormGroup(subsection));
        });

        return new FormGroup(Object.fromEntries(subsectionGroups));
    }

    createForm(template: TTemplateZod) {
        const sectionGroups = new Map<TIdZod | string, FormGroup>();

        if (!template.sections) return new FormGroup(Object.fromEntries(sectionGroups));

        Object.entries(template.sections).forEach(([id, section]) => {
            sectionGroups.set(id, this.createSectionFormGroup(section));
        });

        return new FormGroup(Object.fromEntries(sectionGroups));
    }

    createFormFromTemplate(value: Partial<TTemplateZod> | null) {
        try {
            const template = TemplateSchema.parse(value);

            console.log({ template });

            return this.createForm(template);
        } catch (error) {
            console.log(error);
        }

        return new FormGroup({});
    }

    // -------------- ----------------

    getFieldFormRef(fieldId: TIdZod, subsectionId: TIdZod, sectionId: TIdZod) {
        return this.#form?.get(`${sectionId}`)?.get(`${subsectionId}`)?.get(`${fieldId}`);
    }

    getSubsectionFormRef(subsectionId: TIdZod, sectionId: TIdZod) {
        return this.#form?.get(`${sectionId}`)?.get(`${subsectionId}`);
    }

    getSectionFormRef(sectionId: TIdZod) {
        return this.#form?.get(`${sectionId}`);
    }

    // end: form ------------------------------------------
}