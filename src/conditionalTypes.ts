import { SetDifference, Primitive } from 'utility-types';

export type ValueOf<T extends object> = T[keyof T];

type OptionalValues<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? T[K] : never;
}[keyof T];
type OnlyOptionalValues<T> = SetDifference<OptionalValues<T>, truthyNonCurlies>;

export type NestedPartialWarningStr = 'mergePartially.deep does not allow a seed object to have values on it that are optional objects. Please use mergePartially.shallow instead. See https://github.com/dgreene1/merge-partially/blob/master/whyShallowInstead.md for more information.';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type truthyNonCurlies = number | Date | string | symbol | Set<any> | any[] | (() => any) | null | undefined;

interface IDeepObj {
  userName: string;
  preferences?: {
    lastUpdated: Date;
    favoriteColor?: string;
    backupContact?: string;
  };
}

type test1 = NoNestedOptionalObjectsDeep<IDeepObj>;
type test2 = SetDifference<ValueOf<IDeepObj>, truthyNonCurlies>;
type test3 = OnlyOptionalValues<test2>;

export type NoNestedOptionalObjectsDeep<T> = OnlyOptionalValues<T> extends never
  ? NestedPartialProblemPreventer<T>
  : NestedPartialWarningStr;
export type NoNestedOptionalOnObject<T extends object> = OnlyOptionalValues<
  SetDifference<ValueOf<T>, truthyNonCurlies>
> extends never
  ? T
  : NestedPartialWarningStr;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NestedPartialProblemPreventer<T> = T extends ((...args: any[]) => any) | Primitive
  ? T
  : T extends DeepNoNestedOptionalArray<infer U>
  ? DeepNoNestedOptionalArray<U>
  : T extends object
  ? NoNestedOptionalOnObject<T>
  : T;

/** @private */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepNoNestedOptionalArray<T> extends ReadonlyArray<NestedPartialProblemPreventer<T>> {}
