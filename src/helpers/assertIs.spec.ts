import { assertNever } from './assertIs';

describe('assertNever', () => {
  it('should throw when something accidentally snuck by', () => {
    // Arrange
    const someScenarioThatShouldNeverHaveOccurred = ({} as unknown) as never;

    // Act
    const theCall = () => assertNever(someScenarioThatShouldNeverHaveOccurred, 'testKey');

    // Assert
    expect(theCall).toThrowError('Item of key name testKey had a type that is unsupported by this: {}');
  });
});
