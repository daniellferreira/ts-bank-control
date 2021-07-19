import './util/module-alias';
import { SetupServer } from '@src/server';
import { config } from '@src/services/config';

const run = async (): Promise<void> => {
  const server = new SetupServer(config.port);
  await server.init();
  server.start();
};

run();
