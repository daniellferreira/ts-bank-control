import { SetupServer } from '@src/server';
import { config } from '@src/services/config';

describe('Server tests', () => {
  it('should start server successfully', async () => {
    const server = new SetupServer(config.port);
    await server.init();
    server.start();
    await server.close();
  });
});
