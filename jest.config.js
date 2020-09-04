module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: false, // Don't run it during the test run (for speed reasons), but only during coveralls run: https://github.com/jest-community/vscode-jest/issues/370
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*_spec*',
    '!**/*aModuleToMock.ts',
    '!**/*.config.*',
    '!**/build/**',
    '!**/dist/**',
    '!dist/**',
    '!**/coverage',
    '!**/serverless',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
