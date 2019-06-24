import deepClone from 'clone-deep'

/**
 * Returns a copy of defaultObj with any non-undefined parameters from valuesToFold
 * @param defaultObj
 * @param valuesToFold
 */
export const mergePartially = <T extends object>(defaultObj: T, valuesToFold: Partial<T> | undefined): T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = deepClone(defaultObj);
    if (!valuesToFold) {
        return result;
    }

    Object.keys(valuesToFold).forEach(aKey => {
        const aKeyStrict = aKey as keyof T;
        const newValue = valuesToFold[aKeyStrict];
        if (newValue !== undefined) {
            result[aKeyStrict] = newValue as T[keyof T];
        }
    });

    return result;
};