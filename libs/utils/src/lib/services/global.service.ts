import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { TField, TId } from '../types';

@Injectable()
export class GlobalService {
    #source: Record<string, unknown> | unknown[] | null = null;
    #fields: TField[] = [];
    #fieldMap: Map<TId, TField> = new Map<TId, TField>();
    #dependentObserverMap = new Map<TId, Subject<symbol>>();
    #dependentAndFieldMap: Map<TId, TId[]> = new Map<TId, TId[]>();

    get source(): Record<string, unknown> | unknown[] | null {
        return this.#source;
    }

    set source(value: Record<string, unknown>) {
        this.#source = value;
    }

    get fields(): TField[] {
        return this.#fields;
    }

    set fields(fields: TField[]) {
        this.#fields = fields;

        this.#fieldMap = this.createFieldMap(fields);
        this.#dependentObserverMap = this.createDependentObserverMap(this.#fieldMap); // TODO: You should call this in a subsection component, so that when subsction is visible then only it will create (not create exactly, it should add or remove observables not replace) the observer
        this.#dependentAndFieldMap = this.createDependentAndFieldMap(this.#fieldMap);

        console.log('fields', this.#fields);
        console.log('fieldMap', this.#fieldMap);
        console.log('dependentObserverMap', this.#dependentObserverMap);
        console.log('dependentAndFieldMap', this.#dependentAndFieldMap);
    }

    // -------------------- Field Map -----------------------

    get fieldMap(): Map<TId, TField> {
        return this.#fieldMap;
    }

    set fieldMap(value: Map<TId, TField>) {
        this.#fieldMap = value;
    }

    createFieldMap(fields: TField[]) {
        if (!fields.every((field) => field.id)) {
            throw new Error('Field id is required');
        }

        const fieldMap = new Map<TId, TField>();

        fields.forEach((field) => {
            fieldMap.set(field.id, field);
        });

        return fieldMap;
    }

    // ------------------- Dependendent observer map ---------------------------

    get dependentObserverMap(): Map<TId, Subject<symbol>> {
        return this.#dependentObserverMap;
    }

    set dependentObserverMap(value: Map<TId, Subject<symbol>>) {
        this.#dependentObserverMap = value;
    }

    createDependentObserverMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentObserverMap = new Map<TId, Subject<symbol>>();

        fieldMap.forEach((field) => {
            if (field?.dependsOn) {
                dependentObserverMap.set(field.id, new Subject<symbol>());
            }
        });

        return dependentObserverMap;
    }

    getDependentObserver(id: TId) {
        return this.#dependentObserverMap.get(id);
    }

    triggerDependentObserver(id: TId) {
        this.#dependentObserverMap.get(id)?.next(Symbol());
    }

    removeDependentObserver(id: TId) {
        this.#dependentObserverMap.delete(id);
    }

    // ---------------------- Dependant and field map -------------------------------

    get dependentAndFieldMap(): Map<TId, TId[]> {
        return this.#dependentAndFieldMap;
    }

    set dependentAndFieldMap(value: Map<TId, TId[]>) {
        this.#dependentAndFieldMap = value;
    }

    createDependentAndFieldMap(fieldMap: Map<TId, TField>) {
        if (!fieldMap.size) {
            throw Error('Field map is required');
        }

        const dependentAndFieldMap = new Map<TId, TId[]>();

        fieldMap.forEach((field) => {
            field?.dependsOn?.forEach((dependent) => {
                const fields = dependentAndFieldMap.get(dependent) ?? [];
                fields.push(field.id);
                dependentAndFieldMap.set(dependent, fields);
            });
        });

        return dependentAndFieldMap;
    }

    getDependentFieldIds(id: TId) {
        return this.#dependentAndFieldMap.get(id);
    }

    getDependentFieldsWithInitialCalculation(id: TId) {
        const dependentFieldIds = this.getDependentFieldIds(id);

        if (!dependentFieldIds) {
            return [];
        }

        return dependentFieldIds.filter((dependentFieldId) => {
            const dependentField = this.#fieldMap.get(dependentFieldId);

            return dependentField?.calculateValueInitially;
        });
    }
}
