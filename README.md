[![Coverage Status](https://coveralls.io/repos/github/dgreene1/merge-partially/badge.svg?branch=master)](https://coveralls.io/github/dgreene1/merge-partially?branch=master)

# merge-partially

`mergePartially` is a convenience method for overwriting only the values you want

<!-- toc -->

- [Design Goals](#design-goals)
- [Why would you want to use this:](#why-would-you-want-to-use-this)
  - [First, let's try to write the flexible factory function without mergePartially](#first-lets-try-to-write-the-flexible-factory-function-without-mergepartially)
  - [Now let's refactor using mergePartially](#now-lets-refactor-using-mergepartially)
- [Examples](#examples)
- [F.A.Q. / Troubleshooting](#faq--troubleshooting)
  - [Why wouldn't I just use Object.assign or the spread operator?](#why-wouldnt-i-just-use-objectassign-or-the-spread-operator)
  - [I see lots of TypeScript stuff. Can I use this in JavaScript too?](#i-see-lots-of-typescript-stuff-can-i-use-this-in-javascript-too)
  - [What's the difference between .deep and .shallow?](#whats-the-difference-between-deep-and-shallow)
  - [Why is `.shallow` even necessary?](#why-is-shallow-even-necessary)

<!-- tocstop -->

## Design Goals

1. the resulting object will always be the same type/`interface` as the seed object
2. it will always be “Typescript first” so you know the type definitions will not differ at runtime (like many of this library's competitors)
3. all PRs should allow consumers of the library to feel confident to use this library in production and bullet-proof testing scenarios. High code-coverage percentages gaurantee this.

## Why would you want to use this:

**tl;dr:** with `mergePartially` helps you fold objects together without overwriting the originals. You can have less brittle tests but with all the flexibility you need.

There are many use cases, but I find this function to be most useful in testing scenarios.

**Context:** Often times when creating a factory function for tests, you want to be able to create a function that

```typescript
interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

function makeFakeUser(): IUser {
  return {
    id: 1,
    age: 42,
    firstName: 'John',
    lastName: 'Smith',
  };
}
```

But what happens when unit test #2 needs the firstName value to be _different?_ If you change the hard-coded value inside of makeFakeUser, then you break unit test #1. So if you don't proceed carefully, then makeFakeUser is at risk of creating brittle tests!

A more flexible approach is provide default values and allow the user to provide their own values.

### First, let's try to write the flexible factory function without mergePartially

Ugh this is gonna be long...

```typescript
function makeFakeUser(overrides?: Partial<IUser>): IUser {
  const defaults = {
    id: 1,
    age: 42,
    firstName: 'John',
    lastName: 'Smith',
  };

  const result = {
    id: overrides && overrides.id !== undefined ? overrides.id : defaults.id,
    age: overrides && overrides.age !== undefined ? overrides.age : defaults.age,
    firstName: overrides && overrides.firstName !== undefined ? overrides.firstName : defaults.firstName,
    lastName: overrides && overrides.lastName !== undefined ? overrides.lastName : defaults.lastName,
  };

  return result;
}
```

### Now let's refactor using mergePartially

Wow look how much fewer lines and characters we have to write to accomplish the same thing:

```typescript
import { mergePartially, NestedPartial } from 'merge-partially';

function makeFakeUser(overrides?: NestedPartial<IUser>): IUser {
  return mergePartially.deep(
    {
      id: 1,
      age: 42,
      firstName: 'John',
      lastName: 'Smith',
    },
    overrides
  );
}
```

## Examples

See [the unit tests](https://github.com/dgreene1/merge-partially/blob/master/src/index.spec.ts) for various examples.

## F.A.Q. / Troubleshooting

### Why wouldn't I just use Object.assign or the spread operator?

These two functions have different goals. `Object.assign` can merge two different types into a combination type. `mergePartially` always returns the same type as the seed object. That's one of many reasons why `mergePartially` is safer than `Object.assign`.

### I see lots of TypeScript stuff. Can I use this in JavaScript too?

Yes. Even though the examples are in TypeScript (since it helps to illustrate the problem that `mergePartially` solves), you can just remove the type annotations when using `mergePartially`.

### What's the difference between .deep and .shallow?

- The main difference is that `.deep` allows you to pass multiple levels of partially supplied objects but `.shallow` only allows partial objects at the first level.
  - On a more technical level, `.deep` allows you to pass in `NestedPartial<T>` as where `.shallow` only accepts `Partial<T>`
- Both will always return the full object

For example:

```ts
interface ISeed {
  a: {
    b: {
      c: string;
      d: string;
    };
  };
}

const seed: ISeed = {
  a: {
    b: {
      c: 'c',
      d: 'd',
    },
  },
};

const deepResult = mergePartially.deep(seed, { a: { b: { d: 'new d' } } });
const shallowResult = mergePartially.shallow(seed, {
  a: {
    b: {
      c: 'I had to supply a value for c here but I did not have to supply it in .deep',
      d: 'new d',
    },
  },
});
```

### Why is `.shallow` even necessary?

There are some data types that are "less-compatible" with the library and therefore require a workaround ([click here for the description](https://github.com/dgreene1/merge-partially/blob/master/whyShallowInstead.md)). It should be rare that you need to use `.shallow`, but you might prefer `.shallow` over `.deep` anyway for explicitness.

### Why is my return type some strange error string?

In order to meet the design goals (see above), mergePartially proactively prevents certain data combinations. See this link for more information on the soluton: [https://github.com/dgreene1/merge-partially/blob/master/whyShallowInstead.md](https://github.com/dgreene1/merge-partially/blob/master/whyShallowInstead.md)

## Contributions

PRs are welcome. To contribute, please either make a Github issue or find one you'd like to work on, then fork the repo to make the change.
