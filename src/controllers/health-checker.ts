import { Controller, Get } from '@overnightjs/core';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from '@src/enums/status-codes';

@Controller('')
export class HealthCheckerController {
  @Get('ping')
  public async get(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.status(StatusCodes.OK).send('pong');
    } catch (err) {
      next(err);
    }
  }
}
