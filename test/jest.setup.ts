import { SetupServer } from '@src/server';
import supertest from 'supertest';
import testConfig from '@test/config';

let server: SetupServer;

beforeAll(async () => {
  server = new SetupServer();
  await server.init();

  testConfig.requester = supertest(server.getApp());
});

afterAll(async () => await server.close());
