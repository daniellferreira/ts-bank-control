import { Controller, Get } from '@overnightjs/core';
import { NextFunction, Request, Response } from 'express';
import { AccountService } from '@src/services/account';
import { StatusCodes } from '@src/enums/status-codes';

export interface FinanceOperation {
  readonly account_id: string;
  readonly amount: number;
}

@Controller('account')
export class AccountController {
  constructor(private accountService = new AccountService()) {}

  @Get('')
  public async get(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const account = await this.accountService.getCreatedAccount();

      res.status(StatusCodes.OK).send(account);
    } catch (err) {
      next(err);
    }
  }
}
