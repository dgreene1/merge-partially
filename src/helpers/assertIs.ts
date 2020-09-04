export function assertNever(value: never, key: string | number): never {
  throw new Error(`Item of key name ${key} had a type that is unsupported by this: ${JSON.stringify(value)}`);
}
