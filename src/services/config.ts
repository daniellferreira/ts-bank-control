export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

interface Config {
  environment: Environment;
  port: number;
  db: {
    connectionString: string;
  };
}

const config: Config = {
  environment: process.env.NODE_ENV as Environment,
  port: parseInt(process.env.PORT as string) || 3000,
  db: {
    connectionString: process.env.DB_CONNECTIONSTRING as string,
  },
};

export { config };
