import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';

import { getFromJson } from '../helpers';
import { TField, TId, TSection, TSubsection, TTemplate, TemplateSchema } from '../schemas';

@Injectable()
export class GlobalService {
    #source = signal<Record<string, unknown> | unknown[] | null>(null);

    #template = signal<TTemplate | null>(null);
    #form: FormGroup | null = null;

    #fieldMap = new Map<string | number, TField>();

    // field value
    #fieldValueDependentObserverMap = new Map<TId, Subject<symbol>>();
    #fieldValueDependentAndFieldMap = new Map<TId, Set<TId>>();

    // field disable
    #fieldDisableDependentObserverMap = new Map<TId, Subject<symbol>>();
    #fieldDisableDependentAndFieldMap = new Map<TId, Set<TId>>();

    // validators
    #fieldValidatorDependentObserverMap = new Map<TId, Subject<symbol>>();
    #fieldValidatorDependentAndFieldMap = new Map<TId, Set<TId>>();

    // subsection
    #subsectionMap = new Map<string | number, TSubsection>();
    #subsectionFieldShowHideDependentObserverMap = new Map<TId, BehaviorSubject<symbol>>();

    // show
    #fieldShowDependentAndFieldMap = new Map<TId, Set<TId>>();

    // hide
    #fieldHideDependentAndFieldMap = new Map<TId, Set<TId>>();

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

    setTemplate(value: Partial<TTemplate> | null) {
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

            // TODO: Manage all dependencies in one map of observables
            this.#fieldValueDependentObserverMap = this.createFieldDependentObserverMap(this.#fieldMap); // TODO: You should call this in a subsection component, so that when subsction is visible then only it will create (not create exactly, it should add or remove observables not replace) the observer
            this.#fieldDisableDependentObserverMap = this.createFieldDependentObserverMap(this.#fieldMap); // TODO: You should call this in a subsection component, so that when subsction is visible then only it will create (not create exactly, it should add or remove observables not replace) the observer
            this.#fieldValidatorDependentObserverMap = this.createFieldDependentObserverMap(this.#fieldMap); // TODO: You should call this in a subsection component, so that when subsction is visible then only it will create (not create exactly, it should add or remove observables not replace) the observer

            this.#subsectionFieldShowHideDependentObserverMap = this.createSubsectionDependentObserverMap(
                this.#subsectionMap,
            );

            this.#fieldValueDependentAndFieldMap = this.createFieldValueDependentAndFieldMap(this.#fieldMap);
            this.#fieldDisableDependentAndFieldMap = this.createFieldDisableDependentAndFieldMap(this.#fieldMap);
            this.#fieldValidatorDependentAndFieldMap = this.createFieldValidatorDependentAndFieldMap(this.#fieldMap);
            this.#fieldShowDependentAndFieldMap = this.createFieldShowDependentAndFieldMap(this.#fieldMap);
            this.#fieldHideDependentAndFieldMap = this.createFieldHideDependentAndFieldMap(this.#fieldMap);

            console.log('Global 2 template', this.#template());
            console.log('Global 2 form', this.#form);
            console.log('Global 2 fieldMap', this.#fieldMap);
            console.log('Global 2 fieldDependentObserverMap', this.#fieldValueDependentObserverMap);
            console.log('Global 2 fieldDisableDependentObserverMap', this.#fieldDisableDependentObserverMap);
            console.log('Global 2 fieldValidatorDependentObserverMap', this.#fieldValidatorDependentObserverMap);
            console.log('Global 2 fieldValueDependentAndFieldMap', this.#fieldValueDependentAndFieldMap);
            console.log('Global 2 fieldDisableDependentAndFieldMap', this.#fieldDisableDependentAndFieldMap);
            console.log('Global 2 fieldValidatorDependentAndFieldMap', this.#fieldValidatorDependentAndFieldMap);
            console.log('Global 2 fieldShowDependentAndFieldMap', this.#fieldShowDependentAndFieldMap);
            console.log('Global 2 fieldHideDependentAndFieldMap', this.#fieldHideDependentAndFieldMap);
        } catch (error) {
            console.error(error);
        }
    }

    // create field map
    createMaps(template: Partial<TTemplate>): [Map<TId, TField>, Map<TId, TSubsection>] | [null, null] {
        const fieldMap = new Map<TId, TField>();
        const subsectionMap = new Map<TId, TSubsection>();

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
                        const field: TField = fields[fieldId];

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

    createSubsectionDependentObserverMap(subsectionMap: Map<TId, TSubsection>) {
        if (!subsectionMap.size) {
            throw Error('Field map is required');
        }

        const dependentObserverMap = new Map<TId, BehaviorSubject<symbol>>();

        subsectionMap.forEach((subsection) => {
            dependentObserverMap.set(subsection.id, new BehaviorSubject<symbol>(Symbol()));
        });

        return dependentObserverMap;
    }

    // create observer for each field
    createFieldDependentObserverMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentObserverMap = new Map<TId, Subject<symbol>>();

        fieldMap.forEach((field) => {
            dependentObserverMap.set(field.id, new Subject<symbol>());
        });

        return dependentObserverMap;
    }

    updateDependentAndFieldMap(dependentAndFieldMap: Map<TId, Set<TId>>, dependent: TId, field: TField) {
        const fields = dependentAndFieldMap.get(dependent) ?? new Set<TId>();

        console.log('dependent ids -- 2', field.name, fields);

        if (fields === undefined) return;

        fields.add(field.id);
        dependentAndFieldMap.set(dependent, fields);
    }

    // create dependent & it's fields map, for field value
    createFieldValueDependentAndFieldMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TId, Set<TId>>();

        fieldMap.forEach((field) => {
            if (field.readonly) return;

            field?.valueDependsOn?.forEach((dependent) => {
                this.updateDependentAndFieldMap(dependentAndFieldMap, dependent, field);
            });
        });

        return dependentAndFieldMap;
    }

    // create dependent & it's fields map, for field value
    createFieldDisableDependentAndFieldMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TId, Set<TId>>();

        fieldMap.forEach((field) => {
            if (field.readonly) return;

            field?.disableDependsOn?.forEach((dependent) => {
                this.updateDependentAndFieldMap(dependentAndFieldMap, dependent, field);
            });
        });

        return dependentAndFieldMap;
    }

    // validator
    createFieldValidatorDependentAndFieldMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TId, Set<TId>>();

        fieldMap.forEach((field) => {
            if (field.readonly) return;

            field?.validatorsDependsOn?.forEach((dependent) => {
                this.updateDependentAndFieldMap(dependentAndFieldMap, dependent, field);
            });

            field?.valueDependsOn?.forEach((dependent) => {
                this.updateDependentAndFieldMap(dependentAndFieldMap, dependent, field);
            });
        });

        return dependentAndFieldMap;
    }

    createFieldShowDependentAndFieldMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TId, Set<TId>>();

        fieldMap.forEach((field) => {
            // if (field.readonly) return;

            field?.showDependsOn?.forEach((dependent) => {
                this.updateDependentAndFieldMap(dependentAndFieldMap, dependent, field);
            });
        });

        return dependentAndFieldMap;
    }

    createFieldHideDependentAndFieldMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TId, Set<TId>>();

        fieldMap.forEach((field) => {
            if (field.readonly) return;

            field?.hideDependsOn?.forEach((dependent) => {
                this.updateDependentAndFieldMap(dependentAndFieldMap, dependent, field);
            });
        });

        return dependentAndFieldMap;
    }

    // start: form ------------------------------------------

    createFieldFormControl(field: TField) {
        return new FormControl(getFromJson(field.path, this.#source()));
    }

    createSubsectionFormGroup(subsection: TSubsection) {
        const fieldControls = new Map<TId | string, FormControl>();

        if (!subsection.fields) return new FormGroup(Object.fromEntries(fieldControls));

        Object.entries(subsection.fields).forEach(([id, field]) => {
            fieldControls.set(id, this.createFieldFormControl(field));
        });

        return new FormGroup(Object.fromEntries(fieldControls));
    }

    createSectionFormGroup(section: TSection) {
        const subsectionGroups = new Map<TId | string, FormGroup>();

        if (!section.subsections) return new FormGroup(Object.fromEntries(subsectionGroups));

        Object.entries(section.subsections).forEach(([id, subsection]) => {
            subsectionGroups.set(id, this.createSubsectionFormGroup(subsection));
        });

        return new FormGroup(Object.fromEntries(subsectionGroups));
    }

    createForm(template: TTemplate) {
        const sectionGroups = new Map<TId | string, FormGroup>();

        if (!template.sections) return new FormGroup(Object.fromEntries(sectionGroups));

        Object.entries(template.sections).forEach(([id, section]) => {
            sectionGroups.set(id, this.createSectionFormGroup(section));
        });

        return new FormGroup(Object.fromEntries(sectionGroups));
    }

    createFormFromTemplate(value: Partial<TTemplate> | null) {
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

    getFieldFormRef(fieldId: TId, subsectionId: TId, sectionId: TId) {
        return this.#form?.get(`${sectionId}`)?.get(`${subsectionId}`)?.get(`${fieldId}`) as FormControl;
    }

    getSubsectionFormRef(subsectionId: TId, sectionId: TId) {
        return this.#form?.get(`${sectionId}`)?.get(`${subsectionId}`) as FormGroup;
    }

    getSectionFormRef(sectionId: TId) {
        return this.#form?.get(`${sectionId}`) as FormGroup;
    }

    // end: form ------------------------------------------

    // start: get list of fields, subsections, sections -------------------------------

    getFields(subsectionId: TId, sectionId: TId) {
        const template = this.#template();

        const fieldMap = template?.sections?.[sectionId]?.subsections?.[subsectionId]?.fields;

        if (!fieldMap) return [];

        return Object.values(fieldMap);
    }

    getSubsections(sectionId: TId) {
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

    getCurrentFieldValueObserver(fieldId: TId) {
        return this.#fieldValueDependentObserverMap.get(fieldId);
    }

    getCurrentFieldDisableObserver(fieldId: TId) {
        return this.#fieldDisableDependentObserverMap.get(fieldId);
    }

    getCurrentFieldValidatorObserver(fieldId: TId) {
        return this.#fieldValidatorDependentObserverMap.get(fieldId);
    }

    getCurrentSubsetionFieldShowHideObserver(subsectionId: TId) {
        return this.#subsectionFieldShowHideDependentObserverMap.get(subsectionId);
    }

    // form value
    updateFormValue(value: unknown, fieldId: TId, subsectionId: TId, sectionId: TId) {
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

    disableFieldForm(value: boolean, fieldId: TId, subsectionId: TId, sectionId: TId) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (value) {
            formControl.disable();
        } else {
            formControl.enable();
        }
    }

    disableSubsectionForm(value: boolean, subsectionId: TId, sectionId: TId) {
        const formGroup = this.getSubsectionFormRef(subsectionId, sectionId);

        if (!formGroup) return;

        if (value) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }

    disableSectionForm(value: boolean, sectionId: TId) {
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

    // start: validator -------------------

    updateRequiredValidator(fieldId: TId, subsectionId: TId, sectionId: TId, remove = false) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.required);
        } else {
            formControl.removeValidators(Validators.required);
        }
    }

    updatePatternValidator(value: string | RegExp, fieldId: TId, subsectionId: TId, sectionId: TId, remove = false) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.pattern(value));
        } else {
            formControl.removeValidators(Validators.pattern(value));
        }
    }

    updateMaxValidator(value: number, fieldId: TId, subsectionId: TId, sectionId: TId, remove = false) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.max(value));
        } else {
            formControl.removeValidators(Validators.max(value));
        }
    }

    updateMinValidator(value: number, fieldId: TId, subsectionId: TId, sectionId: TId, remove = false) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.min(value));
        } else {
            formControl.removeValidators(Validators.min(value));
        }
    }

    updateMaxLengthValidator(value: number, fieldId: TId, subsectionId: TId, sectionId: TId, remove = false) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.maxLength(value));
        } else {
            formControl.removeValidators(Validators.maxLength(value));
        }
    }

    updateMinLengthValidator(value: number, fieldId: TId, subsectionId: TId, sectionId: TId, remove = false) {
        const formControl = this.getFieldFormRef(fieldId, subsectionId, sectionId);

        if (!formControl) return;

        if (!remove) {
            formControl.addValidators(Validators.minLength(value));
        } else {
            formControl.removeValidators(Validators.minLength(value));
        }
    }

    // end: validator ------------------------

    getFieldValueDependentFieldIds(id: TId) {
        return this.#fieldValueDependentAndFieldMap.get(id);
    }

    getFieldDisableDependentFieldIds(id: TId) {
        return this.#fieldDisableDependentAndFieldMap.get(id);
    }

    getFieldValidatorsDependentFieldIds(id: TId) {
        return this.#fieldValidatorDependentAndFieldMap.get(id);
    }

    getFieldShowDependentFieldIds(id: TId) {
        return this.#fieldShowDependentAndFieldMap.get(id);
    }

    getFieldHideDependentFieldIds(id: TId) {
        return this.#fieldHideDependentAndFieldMap.get(id);
    }

    triggerFieldValueDependentObserver(id: TId) {
        this.#fieldValueDependentObserverMap.get(id)?.next(Symbol());
    }

    triggerFieldDisableDependentObserver(id: TId) {
        this.#fieldDisableDependentObserverMap.get(id)?.next(Symbol());
    }

    triggerFieldValidatorDependentObserver(id: TId) {
        this.#fieldValidatorDependentObserverMap.get(id)?.next(Symbol());
    }

    triggerSubsectionFieldShowHideDependentObserver(id: TId) {
        this.#subsectionFieldShowHideDependentObserverMap.get(id)?.next(Symbol());
    }

    triggerAllFieldDisableObservers() {
        this.#fieldMap.forEach((field) => {
            this.triggerFieldDisableDependentObserver(field.id);
        });
    }

    triggerAllFieldValidatorObservers() {
        this.#fieldMap.forEach((field) => {
            this.triggerFieldValidatorDependentObserver(field.id);
        });

        setTimeout(() => {
            console.log('after validator trigger', this.#form);
        }, 1000);
    }

    triggerShowHideObservers(fieldId: TId) {
        // TODO: Disable on hide, when show, run disable conditions
        // TODO: remove validators, add when show

        // get show & hide dependent field ids
        const showDependencyIds = this.getFieldShowDependentFieldIds(fieldId) ?? [];
        const hideDependencyIds = this.getFieldHideDependentFieldIds(fieldId) ?? [];

        console.log('showDependencyIds -----', showDependencyIds);
        console.log('hideDependencyIds -----', hideDependencyIds);

        const fieldIdSet = new Set<TId>([...showDependencyIds, ...hideDependencyIds]);

        console.log('fieldIdSet --------', fieldIdSet);

        // now loop through ids, and get subsection ids, from fieldMap.
        const subsectionIdSet = new Set<TId>();

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
