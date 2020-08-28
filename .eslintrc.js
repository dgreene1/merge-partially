const librariesWeUseSubModulesFrom = [];

module.exports = {
  ignorePatterns: [
    'tsdx.config.js',
    'node_modules/',
    'dist/',
    '**/*.css',
    '**/*.scss',
    '**/*.sass',
    '**/*.less',
    '**/*.json',
    '**/*.eot',
    '**/*.woff',
    '**/*.woff2',
    '**/*.ttf',
    '**/*.svg',
  ],
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  overrides: [
    {
      files: ['*.{js,jsx,ts,tsx}'],
      excludedFiles: [
        '**/*.stories.tsx',
        '*.stories.{tsx,jsx}',
        '*.test.{ts,js,tsx,jsx}',
        '*.spec.{ts,js,tsx,jsx}',
      ],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: false,
            optionalDependencies: false,
            peerDependencies: true, // because we should be able to use React in our code
          },
        ],
        'import/no-internal-modules': [
          'error',
          {
            allow: [
              // We want this directory to use it's own submodules
              '**/src/**/*',
              ...librariesWeUseSubModulesFrom,
            ],
          },
        ],
      },
    },
  ],
  rules: {
    'prettier/prettier': [
      'warn',
      {},
      {
        usePrettierrc: true,
      },
    ],
    'no-console': 'error',
    'no-debugger': 'error',
    'import/names': 'off', // Not needed since TypeScript does this for us
    'import/no-unresolved': 'off', // Not needed since TypeScript does this for us
    'import/no-default-export': 'error', // Here's why this is a great rule: https://blog.neufund.org/why-we-have-banned-default-exports-and-you-should-do-the-same-d51fdc2cf2ad
    'import/no-absolute-path': 'warn', // Unless we can add baseDir but that would break our storybook config
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'error', // Prefer 'unknown' instead
    'react/prop-types': 'off', // TypeScript's compile time validation is enough for us. Runtime would effect performance
    'react/display-name': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: ":matches(ImportNamespaceSpecifier[local.name!='React'])", // Prevents wildcard imports https://github.com/eslint/eslint/issues/4865
        message:
          'Import/export only modules you need. Wildcard imports are discouraged due to the larger package size',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        name: 'lodash',
        message:
          "It's too big. Use native functional methods instead, like .map, .reduce, .filter. If you need a groupBy function then you're probably creating a component is too data-centric and therefore shouldn't live in this more general component library.",
      },
    ],
  },
};
