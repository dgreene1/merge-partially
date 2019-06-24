import { mergePartially } from "./index";

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
            b: 1
        }

        const result = mergePartially(original, {
            b: 0
        });

        expect(result.b).toEqual(0);
        // Prove that mergePartially is a pure function
        expect(original.b).toEqual(1);
    })

    it('should NOT overwrite a number if it is falsy', () => {
        const original = {
            a: 'a',
            b: 2
        }

        const result = mergePartially(original, {
            b: undefined
        });

        expect(result.b).toEqual(2);
        // Prove that mergePartially is a pure function
        expect(original.b).toEqual(2);
    })

    it('should overwrite a string even a falsy string', () => {
        const original = {
            a: 'a',
            b: 'b'
        }

        const result = mergePartially(original, {
            b: ''
        });

        expect(result.b).toEqual('');
        // Prove that mergePartially is a pure function
        expect(original.b).toEqual('b');
    })

    it('should allow users to set a value to null if that is something the original type allows', ()=>{
        const original: IObjWithANullProp = {
            nonNullProp: 3,
            nullableProp: 'is not initialized as null'
        }

        const result = mergePartially(original, {
            nonNullProp: 4,
            nullableProp: null
        })

        expect(result.nonNullProp).toEqual(4),
        expect(result.nullableProp).toEqual(null);
        // Prove that mergePartially is a pure function
        expect(original.nonNullProp).toEqual(3);
        expect(original.nullableProp).toEqual('is not initialized as null');
    })

    it('should NOT overwrite a string if it is undefined', () => {
        const original = {
            a: 'a',
            b: 'b'
        }

        const result = mergePartially(original, {
            b: undefined
        });

        expect(result.b).toEqual('b');
        // Prove that mergePartially is a pure function
        expect(original.b).toEqual('b');
    })

    it('should add a property that was not initially required', () => {
        const original: IObjWithOptionalProperty = {
            requiredProp: "some value"
        }

        const result = mergePartially(original, {
            optionalProp: "a value the original obj didn't have"
        });

        expect(result.optionalProp).toEqual("a value the original obj didn't have");
        // Prove that mergePartially is a pure function
        expect(original.optionalProp).toEqual(undefined);
    })

    it('succeeds where Object.assign does not', () => {
        const objWithTruthyValues: IObjWithOptionalProperty = {
            requiredProp: "some value"
        }

        const resultFromAssign = Object.assign({}, objWithTruthyValues, {
            requiredProp: undefined // <-- this is allowed because Object.assign will merge the two types
        })
        const resultFromMergePartially = mergePartially(objWithTruthyValues, {
            requiredProp: undefined // <-- this is still allowed, it just won't take effect, which is great since it keeps the type honest
        })

        const dejectedErrorMsg = 'I really wish that object.assign did not think that "a" was of type "string & undefined" because that is what lets this error get thrown';
        function thisOnlyTakesAString(a: string) {
            if (a === undefined || a === null) {
                throw new Error(dejectedErrorMsg);
            }
            return a
        }

        // Demonstrate that Object.assign failed to enforce the required property
        // Note that it WOULD have enforced the type if we had written it as Object.assign<{},IObjWithOptionalProperty,IObjWithOptionalProperty>(...
        expect(resultFromAssign.requiredProp).toEqual(undefined);
        expect(() => {
            thisOnlyTakesAString(resultFromAssign.requiredProp)
        }).toThrow(dejectedErrorMsg);
        // Demonstrate that mergePartially doesn't let a required property get undefined
        expect(resultFromMergePartially.requiredProp).toEqual(objWithTruthyValues.requiredProp)
    })

    it('supports nested objects', () => {
        const original = {
            a: 'a',
            b: {
                c: 'c',
            }
        }

        const result = mergePartially(original, {
            b: mergePartially(original.b, {
                c: 'newC'
            })
        });

        expect(result.b.c).toEqual('newC');
        // Prove that mergePartially is a pure function
        expect(original.b.c).toEqual('c');
    })

    it('(CAVEAT) this unfortunately allows excess properties to be passed onward', () => {
        const original = {
            a: 'a',
            b: 'b'
        }
        const overrideObj = {
            b: undefined,
            c: 'hi I am an excess property value'
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
    })

})