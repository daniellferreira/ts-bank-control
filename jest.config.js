const { resolve } = require('path');

const root = resolve(__dirname);

module.exports = {
  rootDir: root,
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  displayName: 'unit-tests',
  testEnvironment: 'node',
  clearMocks: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
};
