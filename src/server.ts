import fs from 'fs';

import {
  Application,
  json,
  urlencoded,
  /* static as staticExpress */
} from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { Server } from '@overnightjs/core';
import { Server as HttpServer } from 'http';

import { ErrorHandler } from '@src/util/error-handler';
import * as database from '@src/util/database';
import { config, Environment } from '@src/services/config';

export class SetupServer extends Server {
  private server!: HttpServer;

  constructor(private port: number = 3000) {
    super(config.environment === Environment.DEVELOPMENT);
  }

  private setupExpress(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private async setupControllers(): Promise<void> {
    // Carrega todas as controllers dinamicamente
    let controllerFiles: string[] = fs.readdirSync('./src/controllers');

    const controllers = controllerFiles
      .filter((ctr) => !ctr.startsWith('__') && ctr.endsWith('.ts'))
      .map((ctr) => ctr.replace('.ts', ''));

    for (const controller of controllers) {
      const controllerFile = await import(`@src/controllers/${controller}`);
      Object.keys(controllerFile)
        .filter((elem) => elem.includes('Controller'))
        .forEach((controllerName) => {
          this.addControllers(new controllerFile[controllerName]());
        });
    }
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  private setupErrorHandler(): void {
    this.app.use(ErrorHandler);
  }

  //   private setupDoc(): void {
  // this.app.use(staticExpress(__dirname + '/docs'));
  //   }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.setupControllers();
    await this.setupDatabase();
    this.setupErrorHandler();
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      console.info(`Server running on PID ${process.pid} port ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await database.close();

    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server?.close((err) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    }
  }

  public getApp(): Application {
    return this.app;
  }
}
