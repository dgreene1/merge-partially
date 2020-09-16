import { mergePartially, NestedPartial } from './index';
import { NestedPartialWarningStr } from './conditionalTypes';
import faker from 'faker';

interface IObjWithOptionalProperty {
  requiredProp: string;
  optionalProp?: string;
}

interface IObjWithANullProp {
  nonNullProp: number;
  nullableProp: string | null;
}

describe('mergePartially', () => {
  describe('supported scenarios', () => {
    it('should overwrite a number even a falsy number (i.e. 0)', () => {
      const seed = {
        a: 'a',
        b: 1,
      };

      const result = mergePartially.deep(seed, {
        b: 0,
      });

      expect(result.b).toEqual(0);
      // Prove that mergePartially is a pure function
      expect(seed.b).toEqual(1);
    });

    it('should overwrite a boolean even a falsy (i.e. false)', () => {
      const original = {
        a: 'a',
        b: true,
      };

      const result = mergePartially.deep(original, {
        b: false,
      });

      expect(result.b).toEqual(false);
      // Prove that mergePartially is a pure function
      expect(original.b).toEqual(true);
    });

    it('should not replace missing properties, but should replace present properties with falsy values', () => {
      interface ITestCase {
        a: string;
        b?: number;
        c: string | null;
      }
      const seed: ITestCase = {
        a: 'a',
        b: 2,
        c: 'c',
      };

      const result = mergePartially.deep(seed, {
        b: undefined,
        c: null,
      });

      expect(result).toEqual({
        a: 'a',
        b: undefined,
        c: null,
      });
      // Prove that mergePartially is a pure function
      expect(seed).toEqual({
        a: 'a',
        b: 2,
        c: 'c',
      });
    });

    it('should overwrite a string even a falsy string', () => {
      const seed = {
        a: 'a',
        b: 'b',
      };

      const result = mergePartially.deep(seed, {
        b: '',
      });

      expect(result.b).toEqual('');
      // Prove that mergePartially is a pure function
      expect(seed.b).toEqual('b');
    });

    it('should allow users to set a value to null if that is something the seed type allows', () => {
      const seed: IObjWithANullProp = {
        nonNullProp: 3,
        nullableProp: 'is not initialized as null',
      };

      const result = mergePartially.deep(seed, {
        nonNullProp: 4,
        nullableProp: null,
      });

      expect(result.nonNullProp).toEqual(4);
      expect(result.nullableProp).toEqual(null);
      // Prove that mergePartially is a pure function
      expect(seed.nonNullProp).toEqual(3);
      expect(seed.nullableProp).toEqual('is not initialized as null');
    });

    it('should replace functions', () => {
      const seed = {
        foo: () => 'response of foo',
      };

      const result = mergePartially.deep(seed, {
        foo: () => `response of foo's replacement`,
      });

      expect(result.foo()).toEqual(`response of foo's replacement`);
      // Prove that mergePartially is a pure function
      expect(seed.foo()).toEqual('response of foo');
    });

    it('is a pure function (i.e. it always returns a copy of the default) even when the override is not present (for convenience sake)', () => {
      const original = {
        a: 'a',
        b: 'b',
      };

      const result = mergePartially.deep(original, undefined);

      expect(original).toBe(original);
      expect(result).not.toBe(original);
    });

    it('is a pure function (i.e. it always returns a copy of the default) even when the override has no values to merge', () => {
      const seed = {
        a: 'a',
        b: 'b',
      };

      const result = mergePartially.deep(seed, {});

      expect(seed).toBe(seed);
      expect(seed).not.toBe(result);
    });

    it('should add a property that was not initially required', () => {
      const seed: IObjWithOptionalProperty = {
        requiredProp: 'some value',
      };

      const result = mergePartially.deep(seed, {
        optionalProp: "a value the seed obj didn't have",
      });

      expect(result.optionalProp).toEqual("a value the seed obj didn't have");
      // Prove that mergePartially is a pure function
      expect(seed.optionalProp).toEqual(undefined);
    });

    it('supports nested objects (automatically with mergePartially.deep)', () => {
      interface ITestCase {
        a: string;
        b: {
          b1: string;
          b2: string;
          b3: {
            b3a: string;
            b3b: string;
            b3c?: string;
          };
        };
        c: string;
      }

      const seed: ITestCase = {
        a: 'a',
        b: {
          b1: 'b1',
          b2: 'b2',
          b3: {
            b3a: 'b3a',
            b3b: 'b3b',
            b3c: undefined,
          },
        },
        c: 'c',
      };

      const override: NestedPartial<ITestCase> = {
        b: {
          b2: 'new value for b2',
          b3: {
            b3a: undefined,
            b3b: 'new value for b3b',
          },
        },
        c: 'new c',
      };

      const result = mergePartially.deep(seed, override);

      // A 1st level object that isn't overriden should stay the same
      expect(result.a).toEqual(seed.a);
      // A 1st level value that is overriden should be updated
      expect(result.c).toEqual('new c');
      // Prove that mergePartially is a pure function
      expect(seed.c).toEqual('c');
      // A 2nd level value that isn't overriden should stay the same
      expect(result.b.b1).toEqual('b1');
      // A 2nd level value that is overriden should be updated
      expect(result.b.b2).toEqual('new value for b2');
      // Prove that mergePartially is a pure function (at 2nd level)
      expect(seed.b.b2).toEqual('b2');
      // A 3rd level value that was originally supplied should be replaced with undefined if it is overriden
      expect(result.b.b3.b3a).toEqual(undefined);
      // A 3rd level value that is overriden should be updated
      expect(result.b.b3.b3b).toEqual('new value for b3b');
      // Prove that mergePartially is a pure function (at 3rd level)
      expect(seed.b.b3.b3b).toEqual('b3b');
      // A 3rd level value that isn't overriden should stay the same
      expect(result.b.b3.b3c).toEqual(undefined);
    });

    it('supports nested objects (manually with mergePartially.shallow-- you can just used mergePartially.deep if you find this cumbersome, but be aware of the caveats described in whyShallowInstead.md)', () => {
      interface ITestCase {
        a: string;
        b: {
          b1: string;
          b2: string;
          b3: {
            b3a: string;
            b3b: string;
            b3c?: string;
          };
        };
        c: string;
      }

      const seed: ITestCase = {
        a: 'a',
        b: {
          b1: 'b1',
          b2: 'b2',
          b3: {
            b3a: 'b3a',
            b3b: 'b3b',
            b3c: undefined,
          },
        },
        c: 'c',
      };

      const result = mergePartially.shallow(seed, {
        b: mergePartially.shallow(seed.b, {
          b2: 'new value for b2',
          b3: mergePartially.shallow(seed.b.b3, {
            b3a: undefined,
            b3b: 'new value for b3b',
          }),
        }),
        c: 'new c',
      });

      // A 1st level object that isn't overriden should stay the same
      expect(result.a).toEqual(seed.a);
      // A 1st level value that is overriden should be updated
      expect(result.c).toEqual('new c');
      // Prove that mergePartially is a pure function
      expect(seed.c).toEqual('c');
      // A 2nd level value that isn't overriden should stay the same
      expect(result.b.b1).toEqual('b1');
      // A 2nd level value that is overriden should be updated
      expect(result.b.b2).toEqual('new value for b2');
      // Prove that mergePartially is a pure function (at 2nd level)
      expect(seed.b.b2).toEqual('b2');
      // A 3rd level value that was originally supplied should be replaced with undefined if it is overriden
      expect(result.b.b3.b3a).toEqual(undefined);
      // A 3rd level value that is overriden should be updated
      expect(result.b.b3.b3b).toEqual('new value for b3b');
      // Prove that mergePartially is a pure function (at 3rd level)
      expect(seed.b.b3.b3b).toEqual('b3b');
      // A 3rd level value that isn't overriden should stay the same
      expect(result.b.b3.b3c).toEqual(undefined);
    });

    it('should replace values even if they are optional', () => {
      interface ITestCase {
        a?: string;
        b?: number;
        c?: string[];
        d?: {
          d1?: number;
          d2?: bigint;
        };
        e: {
          e1?: number;
          e2?: bigint;
        };
      }

      const seed: ITestCase = { e: {} };

      const result = mergePartially.deep(seed, {
        a: 'replacement for a',
        b: 2,
        c: ['c1', 'c2'],
        d: {
          d1: 1,
          d2: BigInt(100000000000000),
        },
        e: {
          e1: 1,
          e2: BigInt(100000000000000),
        },
      });

      // Assert
      expect(result).toMatchObject({
        a: 'replacement for a',
        b: 2,
        c: ['c1', 'c2'],
        d: {
          d1: 1,
          d2: BigInt(100000000000000),
        },
        e: {
          e1: 1,
          e2: BigInt(100000000000000),
        },
      });
      // Ensure the function is pure
      expect(seed).toEqual({
        e: {},
      });
    });

    it('by default replaces objects wholesale (i.e. does not merge or append)', () => {
      interface ITestCase {
        a: string;
        b: string[];
        c: string[];
        d: {
          name: string;
        }[];
        e?: number[];
        f: number[];
      }

      const seed: ITestCase = {
        a: 'a',
        b: ['b1', 'b2'],
        c: ['c1', 'c2'],
        d: [
          {
            name: 'nestedObject1',
          },
          {
            name: 'nestedObject2',
          },
        ],
        f: [1, 2],
      };

      const result = mergePartially.deep(seed, {
        b: ['b1 replacement'],
        d: [
          {
            name: 'nestedObject1 replacement',
          },
        ],
        e: [9, 9, 9, 9],
      });

      // Assert
      expect(result).toEqual({
        a: 'a',
        b: ['b1 replacement'],
        c: ['c1', 'c2'],
        d: [
          {
            name: 'nestedObject1 replacement',
          },
        ],
        e: [9, 9, 9, 9],
        f: [1, 2],
      });
      // Ensure the function is pure
      expect(seed).toEqual({
        a: 'a',
        b: ['b1', 'b2'],
        c: ['c1', 'c2'],
        d: [
          {
            name: 'nestedObject1',
          },
          {
            name: 'nestedObject2',
          },
        ],
        f: [1, 2],
      });
    });
  });

  describe('caveat cases & unsupported scenarios', () => {
    it('(CAVEAT) like all TypeScript functions, it unfortunately allows excess properties to be passed onward unless they are explicity or inline', () => {
      const seed = {
        a: 'a',
        b: 'b',
      };
      const overrideObj = {
        b: undefined,
        c: 'hi I am an excess property value',
      };

      const result = mergePartially.deep(seed, overrideObj);
      // NOTE: TypeScript will catch this error if you (a) use explicit types or (b) if you create the overrideObj inline.
      //      /*
      //      const result = mergePartially.deep(seed, {c: 'extra'});
      //      */
      //      Thankfully, the above code will error with "Argument of type '{ c: string; }' is not assignable to parameter of type 'Partial<{ a: string; b: string; }>'.
      //          Object literal may only specify known properties, and 'c' does not exist in type 'Partial<{ a: string; b: string; }>'.ts(2345)"
      //      This is because object literals have special workarounds for excess properties, but explicit types (and inline types) do not.
      //      Read more here: https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultWithMorePropsEvenThoughTsIsHidingIt = result as any;
      expect(resultWithMorePropsEvenThoughTsIsHidingIt.c).toEqual('hi I am an excess property value');
    });

    it('should not allow null as the base seed', () => {
      // This is to fake out the type system so we can check the runtime assertions
      const input = (null as unknown) as {};
      const scenario = () => mergePartially.deep(input, input);
      expect(scenario).toThrowError('seed must be provided and must not be null/undefined. It was object');
    });

    it('should not allow arrays as the base seed (at least at the time of this writing since it would make the return type very awkward)', () => {
      const scenario = () => mergePartially.deep(['a'], ['a']);
      expect(scenario).toThrowError('this function only supports non-array objects.');
    });

    it('should error if an object has a value on it that is optional and is an object', () => {
      interface IDeepObj {
        userName: string;
        preferences?: {
          lastUpdated: Date;
          favoriteColor?: string;
          backupContact?: string;
        };
      }

      const seed: IDeepObj = {
        userName: 'Bob Smith',
      };

      const result = mergePartially.deep(seed, { preferences: { favoriteColor: 'blue' } });

      // ASSERT
      // The next group of assertions are essentially type-checking unit test
      // The next line ensures that the resolved type was not never
      let ensureItsNotNever = result.toString();
      // We set the variable to itself to avoid "'ensureItsNotNever' is declared but its value is never read.ts(6133)"
      ensureItsNotNever = ensureItsNotNever;
      // The next line will literally not compile if the result at compile time is not the warning string.
      let assertion: NestedPartialWarningStr = result;
      // We set the variable to itself to avoid "'assertion' is declared but its value is never read.ts(6133)"
      assertion = assertion;
      // We check this because this scenario allows for an unforunate runtime result that does not match the compile time type (unless we intervened... which we do now)
      //    Basically result.preferences.lastUpdated would be undefined at runtime but a string at compile time.

      // WORKAROUND via .shallow
      // We have to get around "Property 'lastUpdated' is missing in type '{ favoriteColor: string; }' but required in type '{ lastUpdated: Date; favoriteColor: string; backupContact?: string | undefined; }'.ts(2345)"
      // Notice that override is a Partial<T> not a NestedPartial<T>
      const mockUserFactory = (override: Partial<IDeepObj>): IDeepObj => {
        return mergePartially.shallow(seed, override);
      };
      const resultOfWorkaround = mockUserFactory({
        preferences: {
          lastUpdated: new Date('1999-01-01T12:00:00.000Z'),
          favoriteColor: 'blue',
        },
      });

      expect(resultOfWorkaround).toEqual({
        preferences: {
          favoriteColor: 'blue',
          lastUpdated: new Date('1999-01-01T12:00:00.000Z'),
        },
        userName: 'Bob Smith',
      });
    });

    it('should error if an SECOND LEVEL object has a value on it that is optional and is an object', () => {
      interface IAddress {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      }
      interface IDeepObj {
        userName: string;
        preferences?: {
          lastUpdated: Date;
          favoriteColor?: string;
          backupContact?: string;
          mailingAddress?: IAddress;
        };
      }

      const seed: IDeepObj = {
        userName: 'Bob Smith',
      };

      const override = { preferences: { favoriteColor: 'blue' } };

      const result = mergePartially.deep(seed, override);

      // ASSERT
      // The next group of assertions are essentially type-checking unit test
      // The next line ensures that the resolved type was not never
      let ensureItsNotNever = result.toString();
      // We set the variable to itself to avoid "'ensureItsNotNever' is declared but its value is never read.ts(6133)"
      ensureItsNotNever = ensureItsNotNever;
      // The next line will literally not compile if the result at compile time is not the warning string.
      let assertion: NestedPartialWarningStr = result;
      // We set the variable to itself to avoid "'assertion' is declared but its value is never read.ts(6133)"
      assertion = assertion;
      // We check this because this scenario allows for an unforunate runtime result that does not match the compile time type (unless we intervened... which we do now)
      //    Basically result.preferences.lastUpdated would be undefined at runtime but a string at compile time.

      // WORKAROUND via multiple .shallow calls via multiple factory functions

      // ##### NOTE #####
      //  The following is an example specifically designed to demonstrate factory functions...
      //    ...since this is the most realistic case where you would want to be explicit about nested objects
      // ##### END NOTE ####

      // Arrange
      const mockAddressFactory = (override: Partial<IAddress>): IAddress => {
        // If no override is provided, this totally random object will be returned.
        //    The randomness ensures that tests are not tightly coupled to specific data
        //    ...unless they want to have specific data... in which, case they have to provide that data upon calling the factory funtion
        const addressSeed: IAddress = {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.stateAbbr(),
          zipCode: faker.address.zipCode(),
        };
        return mergePartially.shallow(addressSeed, override);
      };

      const mockPreferencesFactory = (override: Partial<IDeepObj['preferences']>): IDeepObj['preferences'] => {
        const preferncesSeed: IDeepObj['preferences'] = {
          lastUpdated: faker.date.future(),
          backupContact: faker.phone.phoneNumber(),
          favoriteColor: faker.random.word(),
        };
        return mergePartially.shallow(preferncesSeed, override);
      };

      const mockUserFactory = (override: Partial<IDeepObj>): IDeepObj => {
        const userSeed: IDeepObj = {
          userName: faker.name.firstName() + ' ' + faker.name.lastName(),
        };
        return mergePartially.shallow(userSeed, override);
      };

      // Act
      const resultOfWorkaround = mockUserFactory({
        preferences: mockPreferencesFactory({
          mailingAddress: mockAddressFactory({
            state: 'NY',
          }),
        }),
      });

      // Assert
      // This would fail and state would be undefined if our factory functions were improperly set up, or or if mergePartially was misbehaving
      expect(resultOfWorkaround.preferences?.mailingAddress?.state).toEqual('NY');
    });
  });
});
