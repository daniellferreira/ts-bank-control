import { Environment } from '@src/services/config';

describe('Base functional tests', () => {
  it('should run tests with test NODE_ENV', () => {
    expect(process.env.NODE_ENV).toBe(Environment.TEST);
  });
});
