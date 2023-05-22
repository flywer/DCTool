export function removeIds(obj: unknown) {
    if (Array.isArray(obj)) {
        return obj.map(removeIds);
    } else if (obj !== null && typeof obj === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key !== 'id' && key !== 'fromTableSourceList' && key !== 'validate') {
                result[key] = removeIds(value);
            }
        }
        return result;
    } else {
        return obj;
    }
}
