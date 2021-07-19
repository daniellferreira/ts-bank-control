import supertest from 'supertest';

interface ITestConfig {
  requester?: supertest.SuperTest<supertest.Test>;
}

const testConfig: ITestConfig = {
  requester: undefined,
};

export default testConfig;
