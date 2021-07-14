import { Controller, Get } from '@overnightjs/core';
import { NextFunction, Request, Response } from 'express';
import { AccountService } from '@src/services/account';

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

      res.status(200).send(account);
    } catch (err) {
      next(err);
    }
  }
}
