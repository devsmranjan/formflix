import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';

import { getFromJson } from '../helpers';
import { TFieldZod, TIdZod, TSectionZod, TSubsectionZod, TTemplateZod, TemplateSchema } from '../schemas';

@Injectable()
export class Global2Service {
    #source = signal<Record<string, unknown> | unknown[] | null>(null);

    #template = signal<TTemplateZod | null>(null);
    #form: FormGroup | null = null;

    #fieldMap = new Map<string | number, TFieldZod>();

    // field value
    #fieldValueDependentObserverMap = new Map<TIdZod, Subject<symbol>>();
    #fieldValueDependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

    // field disable
    #fieldDisableDependentObserverMap = new Map<TIdZod, Subject<symbol>>();
    #fieldDisableDependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

    // subsection
    #subsectionMap = new Map<string | number, TSubsectionZod>();
    #subsectionFieldShowHideDependentObserverMap = new Map<TIdZod, BehaviorSubject<symbol>>();

    // show
    #fieldShowDependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

    // hide
    #fieldHideDependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

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

            const [fieldMap, subsectionMap] = this.createMaps(template);

            if (fieldMap) {
                this.#fieldMap = fieldMap;
            }

            if (subsectionMap) {
                this.#subsectionMap = subsectionMap;
            }

            this.#fieldValueDependentObserverMap = this.createFieldDependentObserverMap(this.#fieldMap); // TODO: You should call this in a subsection component, so that when subsction is visible then only it will create (not create exactly, it should add or remove observables not replace) the observer
            this.#fieldDisableDependentObserverMap = this.createFieldDependentObserverMap(this.#fieldMap); // TODO: You should call this in a subsection component, so that when subsction is visible then only it will create (not create exactly, it should add or remove observables not replace) the observer
            this.#subsectionFieldShowHideDependentObserverMap = this.createSubsectionDependentObserverMap(
                this.#subsectionMap,
            );

            this.#fieldValueDependentAndFieldMap = this.createFieldValueDependentAndFieldMap(this.#fieldMap);
            this.#fieldDisableDependentAndFieldMap = this.createFieldDisableDependentAndFieldMap(this.#fieldMap);
            this.#fieldShowDependentAndFieldMap = this.createFieldShowDependentAndFieldMap(this.#fieldMap);
            this.#fieldHideDependentAndFieldMap = this.createFieldHideDependentAndFieldMap(this.#fieldMap);

            console.log('Global 2 template', this.#template());
            console.log('Global 2 form', this.#form);
            console.log('Global 2 fieldMap', this.#fieldMap);
            console.log('Global 2 fieldDependentObserverMap', this.#fieldValueDependentObserverMap);
            console.log('Global 2 fieldDisableDependentObserverMap', this.#fieldDisableDependentObserverMap);
            console.log('Global 2 fieldValueDependentAndFieldMap', this.#fieldValueDependentAndFieldMap);
            console.log('Global 2 fieldDisableDependentAndFieldMap', this.#fieldDisableDependentAndFieldMap);
            console.log('Global 2 fieldShowDependentAndFieldMap', this.#fieldShowDependentAndFieldMap);
            console.log('Global 2 fieldHideDependentAndFieldMap', this.#fieldHideDependentAndFieldMap);
        } catch (error) {
            console.error(error);
        }
    }

    // create field map
    createMaps(template: Partial<TTemplateZod>): [Map<TIdZod, TFieldZod>, Map<TIdZod, TSubsectionZod>] | [null, null] {
        const fieldMap = new Map<TIdZod, TFieldZod>();
        const subsectionMap = new Map<TIdZod, TSubsectionZod>();

        try {
            const parsedValue = TemplateSchema.parse(template);

            const sections = parsedValue.sections;

            if (!sections) return [null, null];

            Object.keys(sections).forEach((sectionId) => {
                const section = sections[sectionId];
                const subsections = section.subsections;

                if (!subsections) return;

                Object.keys(subsections).forEach((subsectionId) => {
                    const subsection = subsections[subsectionId];
                    subsectionMap.set(subsection.id, subsection);

                    const fields = subsection.fields;

                    if (!fields) return;

                    Object.keys(fields).forEach((fieldId) => {
                        const field = fields[fieldId];

                        fieldMap.set(field.id, field);
                    });
                });
            });

            return [fieldMap, subsectionMap];
        } catch (error) {
            console.error(error);
        }

        return [null, null];
    }

    createSubsectionDependentObserverMap(subsectionMap: Map<TIdZod, TSubsectionZod>) {
        if (!subsectionMap.size) {
            throw Error('Field map is required');
        }

        const dependentObserverMap = new Map<TIdZod, BehaviorSubject<symbol>>();

        subsectionMap.forEach((subsection) => {
            dependentObserverMap.set(subsection.id, new BehaviorSubject<symbol>(Symbol()));
        });

        return dependentObserverMap;
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

    // create dependent & it's fields map, for field value
    createFieldDisableDependentAndFieldMap(fieldMap: Map<TIdZod, TFieldZod>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

        fieldMap.forEach((field) => {
            // if (field.readonly) return;

            field?.disableDependsOn?.forEach((dependent) => {
                const fields = dependentAndFieldMap.get(dependent) ?? [];
                fields.push(field.id);
                dependentAndFieldMap.set(dependent, fields);
            });
        });

        return dependentAndFieldMap;
    }

    createFieldShowDependentAndFieldMap(fieldMap: Map<TIdZod, TFieldZod>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

        fieldMap.forEach((field) => {
            // if (field.readonly) return;

            field?.showDependsOn?.forEach((dependent) => {
                const fields = dependentAndFieldMap.get(dependent) ?? [];
                fields.push(field.id);
                dependentAndFieldMap.set(dependent, fields);
            });
        });

        return dependentAndFieldMap;
    }

    createFieldHideDependentAndFieldMap(fieldMap: Map<TIdZod, TFieldZod>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TIdZod, TIdZod[]>();

        fieldMap.forEach((field) => {
            // if (field.readonly) return;

            field?.hideDependsOn?.forEach((dependent) => {
                const fields = dependentAndFieldMap.get(dependent) ?? [];
                fields.push(field.id);
                dependentAndFieldMap.set(dependent, fields);
            });
        });

        return dependentAndFieldMap;
    }

    // start: form ------------------------------------------

    createFieldFormControl(field: TFieldZod) {
        return new FormControl(getFromJson(field.path, this.#source()));
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
        return this.#form?.get(`${sectionId}`)?.get(`${subsectionId}`)?.get(`${fieldId}`) as FormControl;
    }

    getSubsectionFormRef(subsectionId: TIdZod, sectionId: TIdZod) {
        return this.#form?.get(`${sectionId}`)?.get(`${subsectionId}`) as FormGroup;
    }

    getSectionFormRef(sectionId: TIdZod) {
        return this.#form?.get(`${sectionId}`) as FormGroup;
    }

    // end: form ------------------------------------------

    // start: get list of fields, subsections, sections -------------------------------

    getFields(subsectionId: TIdZod, sectionId: TIdZod) {
        const template = this.#template();

        const fieldMap = template?.sections?.[sectionId]?.subsections?.[subsectionId]?.fields;

        if (!fieldMap) return [];

        return Object.values(fieldMap);
    }

    getSubsections(sectionId: TIdZod) {
        const template = this.#template();

        const subsectionMap = template?.sections?.[sectionId]?.subsections;

        if (!subsectionMap) return [];

        return Object.values(subsectionMap);
    }

    getSections() {
        const template = this.#template();

        const sectionMap = template?.sections;

        if (!sectionMap) return [];

        return Object.values(sectionMap);
    }

    // end: get list of fields, subsections, sections -------------------------------

    getCurrentFieldValueObserver(fieldId: TIdZod) {
        return this.#fieldValueDependentObserverMap.get(fieldId);
    }

    getCurrentFieldDisableObserver(fieldId: TIdZod) {
        return this.#fieldDisableDependentObserverMap.get(fieldId);
    }

    getCurrentSubsetionFieldShowHideObserver(subsectionId: TIdZod) {
        return this.#subsectionFieldShowHideDependentObserverMap.get(subsectionId);
    }

    // form value
    updateFormValue(value: unknown, fieldId: TIdZod, subsectionId: TIdZod, sectionId: TIdZod) {
        const fieldFormControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        fieldFormControl.setValue(value);
    }

    // update all field value silently
    updateAllFieldValueFromSource() {
        this.#fieldMap.forEach((field) => {
            const formControl = this.getFieldFormRef(field.id, field.subsectionId, field.sectionId);

            if (!formControl) return;

            formControl.setValue(getFromJson(field.path, this.#source()));
        });

        this.triggerAllFieldDisableObservers();
    }

    // start: form disable ----------------

    disableFieldForm(value: boolean, fieldId: TIdZod, subsectionId: TIdZod, sectionId: TIdZod) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (value) {
            formControl.disable();
        } else {
            formControl.enable();
        }
    }

    disableSubsectionForm(value: boolean, subsectionId: TIdZod, sectionId: TIdZod) {
        const formGroup = this.getSubsectionFormRef(subsectionId, sectionId);

        if (!formGroup) return;

        if (value) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }

    disableSectionForm(value: boolean, sectionId: TIdZod) {
        const formGroup = this.getSectionFormRef(sectionId);

        if (!formGroup) return;

        if (value) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }

    disableForm(value: boolean) {
        const formGroup = this.#form;

        if (!formGroup) return;

        if (value) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }

    // end: form disable ----------------

    getFieldValueDependentFieldIds(id: TIdZod) {
        return this.#fieldValueDependentAndFieldMap.get(id);
    }

    getFieldDisableDependentFieldIds(id: TIdZod) {
        return this.#fieldDisableDependentAndFieldMap.get(id);
    }

    getFieldShowDependentFieldIds(id: TIdZod) {
        return this.#fieldShowDependentAndFieldMap.get(id);
    }

    getFieldHideDependentFieldIds(id: TIdZod) {
        return this.#fieldHideDependentAndFieldMap.get(id);
    }

    triggerFieldValueDependentObserver(id: TIdZod) {
        this.#fieldValueDependentObserverMap.get(id)?.next(Symbol());
    }

    triggerFieldDisableDependentObserver(id: TIdZod) {
        this.#fieldDisableDependentObserverMap.get(id)?.next(Symbol());
    }

    triggerSubsectionFieldShowHideDependentObserver(id: TIdZod) {
        this.#subsectionFieldShowHideDependentObserverMap.get(id)?.next(Symbol());
    }

    triggerAllFieldDisableObservers() {
        this.#fieldMap.forEach((field) => {
            this.triggerFieldDisableDependentObserver(field.id);
        });
    }

    triggerShowHideObservers(fieldId: TIdZod) {
        // get show & hide dependent field ids
        const showDependencyIds = this.getFieldShowDependentFieldIds(fieldId) ?? [];
        const hideDependencyIds = this.getFieldHideDependentFieldIds(fieldId) ?? [];

        console.log('showDependencyIds -----', showDependencyIds);
        console.log('hideDependencyIds -----', hideDependencyIds);

        const fieldIdSet = new Set<TIdZod>([...showDependencyIds, ...hideDependencyIds]);

        console.log('fieldIdSet --------', fieldIdSet);

        // now loop through ids, and get subsection ids, from fieldMap.
        const subsectionIdSet = new Set<TIdZod>();

        fieldIdSet.forEach((fieldId) => {
            console.log('this.#fieldMap ---------', this.#fieldMap);
            const field = this.#fieldMap.get(fieldId);

            console.log('field ---------', field);

            if (!field) return;

            subsectionIdSet.add(field.subsectionId);
        });

        console.log('subsectionIdSet ---- ', subsectionIdSet);

        // trigger observers of subsections by id.
        subsectionIdSet.forEach((subsectionId) => {
            this.triggerSubsectionFieldShowHideDependentObserver(subsectionId);
        });
    }
}
