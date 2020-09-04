import { mergePartially, NestedPartial } from './index';

interface IObjWithOptionalProperty {
  requiredProp: string;
  optionalProp?: string;
}

interface IObjWithANullProp {
  nonNullProp: number;
  nullableProp: string | null;
}

describe('mergePartially', () => {
  it('should overwrite a number even a falsy number (i.e. 0)', () => {
    const original = {
      a: 'a',
      b: 1,
    };

    const result = mergePartially(original, {
      b: 0,
    });

    expect(result.b).toEqual(0);
    // Prove that mergePartially is a pure function
    expect(original.b).toEqual(1);
  });

  it('should not replace missing properties, but should replace present properties with falsy values', () => {
    interface ITestCase {
      a: string;
      b?: number;
      c: string | null;
    }
    const original: ITestCase = {
      a: 'a',
      b: 2,
      c: 'c',
    };

    const result = mergePartially(original, {
      b: undefined,
      c: null,
    });

    expect(result).toEqual({
      a: 'a',
      b: undefined,
      c: null,
    });
    // Prove that mergePartially is a pure function
    expect(original).toEqual({
      a: 'a',
      b: 2,
      c: 'c',
    });
  });

  it('should overwrite a string even a falsy string', () => {
    const original = {
      a: 'a',
      b: 'b',
    };

    const result = mergePartially(original, {
      b: '',
    });

    expect(result.b).toEqual('');
    // Prove that mergePartially is a pure function
    expect(original.b).toEqual('b');
  });

  it('should allow users to set a value to null if that is something the original type allows', () => {
    const original: IObjWithANullProp = {
      nonNullProp: 3,
      nullableProp: 'is not initialized as null',
    };

    const result = mergePartially(original, {
      nonNullProp: 4,
      nullableProp: null,
    });

    expect(result.nonNullProp).toEqual(4);
    expect(result.nullableProp).toEqual(null);
    // Prove that mergePartially is a pure function
    expect(original.nonNullProp).toEqual(3);
    expect(original.nullableProp).toEqual('is not initialized as null');
  });

  it('should replace functions', () => {
    const original = {
      foo: () => 'response of foo',
    };

    const result = mergePartially(original, {
      foo: () => `response of foo's replacement`,
    });

    expect(result.foo()).toEqual(`response of foo's replacement`);
    // Prove that mergePartially is a pure function
    expect(original.foo()).toEqual('response of foo');
  });

  it('is a pure function (i.e. it always returns a copy of the default) even when the override is not present (for convenience sake)', () => {
    const original = {
      a: 'a',
      b: 'b',
    };

    const result = mergePartially(original, undefined);

    expect(original).toBe(original);
    expect(original).not.toBe(result);
  });
  it('is a pure function (i.e. it always returns a copy of the default) even when the override has no values to merge', () => {
    const original = {
      a: 'a',
      b: 'b',
    };

    const result = mergePartially(original, {});

    expect(original).toBe(original);
    expect(original).not.toBe(result);
  });

  it('should add a property that was not initially required', () => {
    const original: IObjWithOptionalProperty = {
      requiredProp: 'some value',
    };

    const result = mergePartially(original, {
      optionalProp: "a value the original obj didn't have",
    });

    expect(result.optionalProp).toEqual("a value the original obj didn't have");
    // Prove that mergePartially is a pure function
    expect(original.optionalProp).toEqual(undefined);
  });

  it('supports nested objects', () => {
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

    const original: ITestCase = {
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

    const result = mergePartially(original, override);

    // A 1st level object that isn't overriden should stay the same
    expect(result.a).toEqual(original.a);
    // A 1st level value that is overriden should be updated
    expect(result.c).toEqual('new c');
    // Prove that mergePartially is a pure function
    expect(original.c).toEqual('c');
    // A 2nd level value that isn't overriden should stay the same
    expect(result.b.b1).toEqual('b1');
    // A 2nd level value that is overriden should be updated
    expect(result.b.b2).toEqual('new value for b2');
    // Prove that mergePartially is a pure function (at 2nd level)
    expect(original.b.b2).toEqual('b2');
    // A 3rd level value that was originally supplied should be replaced with undefined if it is overriden
    expect(result.b.b3.b3a).toEqual(undefined);
    // A 3rd level value that is overriden should be updated
    expect(result.b.b3.b3b).toEqual('new value for b3b');
    // Prove that mergePartially is a pure function (at 3rd level)
    expect(original.b.b3.b3b).toEqual('b3b');
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

    const original: ITestCase = { e: {} };

    const result = mergePartially(original, {
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
    expect(original).toEqual({
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

    const original: ITestCase = {
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

    const result = mergePartially(original, {
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
    expect(original).toEqual({
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

  it('(CAVEAT) like all TypeScript functions, it unfortunately allows excess properties to be passed onward unless they are explicity or inline', () => {
    const original = {
      a: 'a',
      b: 'b',
    };
    const overrideObj = {
      b: undefined,
      c: 'hi I am an excess property value',
    };

    const result = mergePartially(original, overrideObj);
    // NOTE: TypeScript will catch this error if you (a) use explicit types or (b) if you create the overrideObj inline.
    //      /*
    //      const result = mergePartially(original, {c: 'extra'});
    //      */
    //      Thankfully, the above code will error with "Argument of type '{ c: string; }' is not assignable to parameter of type 'Partial<{ a: string; b: string; }>'.
    //          Object literal may only specify known properties, and 'c' does not exist in type 'Partial<{ a: string; b: string; }>'.ts(2345)"
    //      This is because object literals have special workarounds for excess properties, but explicit types (and inline types) do not.
    //      Read more here: https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultWithMorePropsEvenThoughTsIsHidingIt = result as any;
    expect(resultWithMorePropsEvenThoughTsIsHidingIt.c).toEqual('hi I am an excess property value');
  });

  it('should error if resulting object no longer satisfies type requirements', () => {
    interface IDeepObj {
      a: string;
      b?: {
        b1: string;
        b2: {
          b2_1: string;
          b2_2: string;
        };
      };
    }

    const original: IDeepObj = {
      a: 'a',
    };

    expect(() => {
      mergePartially(original, { b: { b2: { b2_1: 'b2_1' } } });
    }).toThrow(TypeError);
  });
});
