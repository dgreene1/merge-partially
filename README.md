[![Coverage Status](https://coveralls.io/repos/github/dgreene1/merge-partially/badge.svg?branch=master)](https://coveralls.io/github/dgreene1/merge-partially?branch=master)

# merge-partially

`mergePartially` is a convenience method for overwriting only the values you want

## I see lots of TypeScript stuff. Can I use this in JavaScript too?

Yes. Even though the examples are in TypeScript (since it helps to illustrate the problem that `mergePartially` solves), you can just remove the type annotations when using `mergePartially`.

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
    age:
      overrides && overrides.age !== undefined ? overrides.age : defaults.age,
    firstName:
      overrides && overrides.firstName !== undefined
        ? overrides.firstName
        : defaults.firstName,
    lastName:
      overrides && overrides.lastName !== undefined
        ? overrides.lastName
        : defaults.lastName,
  };

  return result;
}
```

### Now let's refactor using mergePartially

Wow look how much fewer lines and characters we have to write to accomplish the same thing:

```typescript
function makeFakeUser(overrides?: Partial<IUser>): IUser {
  return mergePartially(
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
