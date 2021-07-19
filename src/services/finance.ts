import { UserError } from '@src/errors/user-error';
import { StatusCodes } from '@src/enums/status-codes';
import { Finance } from '@src/models/finance';
import { AccountService } from '@src/services/account';
import { ClientSession } from 'mongoose';

export class FinanceService {
  constructor(private readonly accountService = new AccountService()) {}

  public async getHistory(account: string) {
    return Finance.find(
      { account },
      { _id: 0, type: 1, amount: 1, createdAt: 1, ticketCode: 1 },
      { lean: true, sort: { createdAt: 'desc' } }
    );
  }

  public async moneyIn(
    session: ClientSession,
    account: string,
    amount: number
  ) {
    await this.accountService.updateAmount(session, account, amount);

    const finance = new Finance({
      type: 'in',
      amount,
      account,
    });

    return await finance.save({ session });
  }

  public async moneyOut(
    session: ClientSession,
    account: string,
    amount: number
  ) {
    await this.accountService.updateAmount(session, account, amount * -1);

    const finance = new Finance({
      type: 'out',
      amount,
      account,
    });
    return await finance.save({ session });
  }

  public async payTicket(
    session: ClientSession,
    account: string,
    amount: number,
    ticketCode?: string
  ) {
    this.validateTicketCode(ticketCode);

    await this.accountService.updateAmount(session, account, amount * -1);

    const finance = new Finance({
      type: 'payment_ticket',
      amount,
      account,
      ticketCode,
    });
    return await finance.save({ session });
  }

  public validateTicketCode(ticketCode?: string): void {
    if (!ticketCode) {
      throw new UserError(
        'Campo Linha Digitável é obrigatório para realizar um pagamento',
        StatusCodes.BadRequest
      );
    }
  }
}
