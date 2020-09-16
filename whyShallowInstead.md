# Why the deep version of the library is not working for you

Let's dive into why you are getting an error saying that the data type you submitted is not supported.

In the following example, what would you expect `result.preferences.lastUpdated` to be?

```ts
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

const result = mergePartially.deep(seed, {
  preferences: {
    favoriteColor: 'blue',
  },
});
```

The correct answer is that `result.preferences.lastUpdated` is `undefined` at runtime since it was not supplied by `seed` or by the override. Unfortunately, the TypeScript compiler thinks that `result.preferences.lastUpdated` is `Date` due to the way that the Partial type works. This is a problem. The runtime type and the compile-time type should be the same.

So to ensure that the mergePartially library meets it's design goals of preventing the compile-time type from being incorrect, we've guarded from this case by defensively returning a type that clarifies the problem.

## Solutions

There are multiple solutions depending on your circumstances.

## What you think might solve it, but won't actually solve the problem

Q: Why don't I just make sure that the `seed` object has the optional object?
A: Because Typescript only knows the interface type, not the type that arrives at runtime. So mergePartially will still think that the optional object might not be there at runtime.

## Solve by using mergePartially.shallow (START WITH THIS SOLUTION):

This is likely the best first option since it will make it clear to you what the problem is. By using mergePartially.shallow you can ensure that each level of the nested object is fully populated by the seed and/or the override.

```ts
const result = mergePartially.shallow(seed, {
    preferences: {
        lastUpdated: new Date(), // <-- Yay, Typescript required us to pass lastUpdated. mergePartially.deep did not, but it still protects from this scenario.
        favoriteColor: 'blue',
    });
```

What this means is "if you pass a `preferences` object, you are going to have to pass all of it (because it's a nested object)." And maybe the developers find this to be acceptable.

However, if you still have a scenario where you only want to provide a part of the nested object, continue below to one of the other solutions

## Solve by changing the type for the seed to not have optional objects:

This solution is not always available, but it will certainly make your code simpler. This might be harder to do if the type comes from an API; however, if you're using mergePartially in test code for the purposes of factory, it's perfectly reasonable to have the test code that provides a safer data type than what the API responds with. Also, just a random suggestion here, but please ask your API developer if the optional object can be made required-- you might find that they already do gaurantee (via their own API test) that it is sent and that your interface is just out of date.

So if you were able to make the following change, you can continue to `use mergePartially.deep`. If not, skip below to the next potential solution.

```ts
// Replace this...
interface IDeepObj {
  userName: string;
  preferences?: {
    lastUpdated: Date;
    favoriteColor?: string;
    backupContact?: string;
  };
}
// ...with a interface where preferences is required
interface IDeepObj {
  userName: string;
  preferences: {
    // i.e. we deleted the question mark from preferences
    lastUpdated: Date;
    favoriteColor?: string;
    backupContact?: string;
  };
}
```

Why is this acceptable to mergePartially? Because the seed requires you to pass in preferences which means you don't end up with the original problem where `result.preferences.lastUpdated` was `undefined` at runtime.

See here:

```ts
interface IDeepObj {
  userName: string;
  preferences: {
    lastUpdated: Date;
    favoriteColor?: string;
    backupContact?: string;
  };
}

const seed: IDeepObj = {
  userName: 'Bob Smith',
  preferences: {
    // The preferences object is required now, and therefore the preferences.lastUpdated property is also required thus ensuring that result is the same type as the seed
    lastUpdated: new Date(),
  },
};

const result = mergePartially.deep(seed, {
  preferences: {
    favoriteColor: 'blue',
  },
});
```

## Solve by explicitly requiring each nested object

This solution is the most verbose, but it is the most explicit about what is required. The best time to use this solution is if you are in test code and you want to make sure that unit tests are clear about what data is being set up.

So with that in mind, the following example will utilize factory functions to show how multiple unit tests might rely on the same factory function.

```ts
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
```

Notice that you could just as easily called `mockUserFactory` again if you wanted to arrange for a test to have a different state abbreviation. That's the power of factory functions + mergePartially.

## Other solutions

It's our hope that most people won't run into this nested optional object problem. However, if you have encountered this error and the solutions above do not work for you, please create a Github issue describing your scenario and your desired results. We thrive on feedback and look forward to finding the ideal solution. That being said, most users have reported that the above solutions resolve and in some cases even improve their code.
