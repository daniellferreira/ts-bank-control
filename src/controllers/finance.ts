import { Controller, Get, Post } from '@overnightjs/core';
import { NextFunction, Request, Response } from 'express';
import { FinanceService } from '@src/services/finance';
import { startSession } from 'mongoose';

export interface FinanceOperationBody {
  readonly account_id: string;
  readonly amount: number;
  readonly ticket_code?: string;
}

export interface GetHistoryParams {
  readonly accountId: string;
}

@Controller('finance')
export class FinanceController {
  constructor(private financeService = new FinanceService()) {}

  @Get(':accountId')
  public async getHistory(
    req: Request<GetHistoryParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { accountId } = req.params;

      const history = await this.financeService.getHistory(accountId);

      res.status(200).send(history);
    } catch (err) {
      next(err);
    }
  }

  @Post('deposit')
  public async makeDeposit(
    req: Request<undefined, undefined, FinanceOperationBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const session = await startSession();

    try {
      session.startTransaction();

      const { account_id, amount } = req.body;
      await this.financeService.moneyIn(session, account_id, amount);

      await session.commitTransaction();

      res.status(200).send();
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  }

  @Post('draft')
  public async makeDraft(
    req: Request<undefined, undefined, FinanceOperationBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const session = await startSession();

    try {
      session.startTransaction();

      const { account_id, amount } = req.body;

      await this.financeService.moneyOut(session, account_id, amount);

      await session.commitTransaction();

      res.status(200).send();
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  }

  @Post('payment/ticket')
  public async makeTicketPayment(
    req: Request<undefined, undefined, FinanceOperationBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const session = await startSession();

    try {
      session.startTransaction();

      const { account_id, amount, ticket_code } = req.body;

      await this.financeService.payTicket(
        session,
        account_id,
        amount,
        ticket_code
      );

      await session.commitTransaction();

      res.status(200).send();
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  }
}
