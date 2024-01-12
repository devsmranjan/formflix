import { JSONPath } from 'jsonpath-plus';
import { set } from 'lodash-es';

export const getValueByQuery = (json: Record<string, unknown> | unknown[] | null, query: string) => {
    if (!json) return;

    return JSONPath({
        path: query,
        json,
        wrap: false,
    });
};

export function setToJson(object: Record<string, unknown> | unknown[] | null, path: string, value: unknown) {
    if (!object) return;

    return set(object, path, value);
}
