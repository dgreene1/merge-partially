module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*_spec*',
    '!**/*aModuleToMock.ts',
    '!**/*.config.*',
    '!**/build/**',
    '!**/coverage',
    '!**/serverless',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
