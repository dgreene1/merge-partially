import deepClone from 'clone-deep';
import { DeepPartial } from 'utility-types';
import { assertNever } from './helpers/assertIs';

interface KVP<K extends Indexable, V> {
  key: K;
  value: V;
}

/**
 * Returns an array of key/value pairs
 * @param object the object you want to translate into an array of key/value pairs
 */
const toKVP = <T extends Record<K, T[K]>, K extends keyof T>(object: T): Array<KVP<string, T[K]>> => {
  return Object.keys(object).map(key => {
    const keyStrict = key as K;
    return { key, value: object[keyStrict] };
  });
};

type Indexable = string | number | symbol;
type Callable = (args: unknown) => unknown;
type AllBasics = number | string | undefined | null | bigint | symbol | Callable | Record<Indexable, unknown>;
type AllPossibleValues = AllBasics | Array<AllBasics>;
type ARecordOfAllPossible = Record<Indexable, AllPossibleValues>;

const determineNewValue = (input: {
  keyToOverride: string | number;
  oldValue: AllPossibleValues;
  newValue: AllPossibleValues;
}): { keyToOverride: string | number; newValue: AllPossibleValues } => {
  const { keyToOverride, oldValue, newValue } = input;

  // Since the consumer supplied a newValue, it's time to figure out how to properly replace it
  if (
    typeof newValue === 'string' ||
    typeof newValue === 'number' ||
    typeof newValue === 'bigint' ||
    typeof newValue === 'function' ||
    typeof newValue === 'symbol'
  ) {
    // There's nothing to iterate over, so return the override
    return { keyToOverride, newValue };
  } else if (typeof newValue === 'object') {
    if (Array.isArray(newValue)) {
      // replace the whole array
      return { keyToOverride, newValue };
    }

    if (newValue === null) {
      return { keyToOverride, newValue };
    }
    if (typeof oldValue !== 'object' || !oldValue) {
      return { keyToOverride, newValue };
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return { keyToOverride, newValue: mergePartially(oldValue, newValue) };
  } else if (newValue === undefined) {
    // But if the consumer provided the property, they probably wanted to replace the value with undefined. And if we're wrong then TypeScript will have caught this.
    return { keyToOverride, newValue };
  } else {
    /* istanbul ignore next */ // ignore this line since it literally can't be hit
    throw assertNever(newValue, keyToOverride);
  }
};

/**
 * Returns a copy of seed with any non-undefined parameters from override
 * @param seed the object that is used establish the start of what you want the result to look like. This is the object that will be overriden before a result is produced
 * @param override the data that will be used when replacing the seed's key/values
 */
export const mergePartially = <T extends object>(seed: T, override: DeepPartial<T> | undefined): T => {
  const seedCopy = deepClone(seed);
  if (!override) {
    return seedCopy;
  }

  // Lie #1 - the object and it's override are objects with iterable keys.
  const seedRecord = seedCopy as ARecordOfAllPossible;
  const overrideRecord = override as ARecordOfAllPossible;

  const overrideKeyValuePairs = toKVP(overrideRecord);

  for (const overrideKVP of overrideKeyValuePairs) {
    const keyToOverride = overrideKVP.key;
    const { newValue } = determineNewValue({
      keyToOverride: keyToOverride,
      oldValue: seedRecord[keyToOverride],
      newValue: overrideKVP.value,
    });

    seedRecord[keyToOverride] = newValue;
  }

  return seedCopy;
};
