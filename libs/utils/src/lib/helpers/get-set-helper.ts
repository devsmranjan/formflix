import { JSONPath } from 'jsonpath-plus';

export const getFromJson = (path: string, json: Record<string, unknown> | unknown[] | null) => {
    if (!json) return;

    return JSONPath({
        path,
        json,
        wrap: false,
    });
};

type TFullPayload = {
    parent: Record<string | number, unknown>;
    parentProperty: string | number;
};

export const setToJson = (path: string, json: Record<string, unknown> | unknown[] | null, value: unknown) => {
    if (!json) return;

    return JSONPath({
        path,
        json,
        wrap: false,
        callback: (payload: unknown, payloadType: unknown, fullPayload: TFullPayload) => {
            let parent = null;
            let parentProperty = null;

            if (fullPayload && typeof fullPayload === 'object') {
                if (Object.prototype.hasOwnProperty.call(fullPayload, 'parent')) {
                    parent = fullPayload.parent;
                }

                if (Object.prototype.hasOwnProperty.call(fullPayload, 'parentProperty')) {
                    parentProperty = fullPayload.parentProperty;
                }
            }

            if (payloadType === 'value' && parent && parentProperty) {
                parent[parentProperty] = value;
            }

            return payload;
        },
    });
};
