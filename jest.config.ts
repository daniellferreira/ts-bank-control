import { resolve } from 'path';

const root = resolve(__dirname);

export default {
  rootDir: root,
  testMatch: ['<rootDir>/**/*.test.ts'],
  testEnvironment: 'node',
  clearMocks: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
};
