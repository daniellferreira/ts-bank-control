import { StatusCodes, UserError } from '@src/errors/user-error';
import { Account, IAccountDocument } from '@src/models/account';
import { ClientSession } from 'mongoose';

interface UpdateAmountFilter {
  _id: string;
  amount?: any;
}

export class AccountService {
  public async updateAmount(
    session: ClientSession,
    accountId: string,
    amount: number
  ) {
    const filter = this.buildUpdateFilter(accountId, amount);

    const updatedAccount = await Account.findOneAndUpdate(
      filter,
      { $inc: { amount } },
      { runValidators: true, new: true, session }
    );

    this.validatePostUpdateAmount(updatedAccount);

    return updatedAccount;
  }

  public getCreatedAccount() {
    return Account.findOneAndUpdate(
      {},
      {},
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        timestamps: false,
      }
    );
  }

  public buildUpdateFilter(
    accountId: string,
    amount: number
  ): UpdateAmountFilter {
    const filter: UpdateAmountFilter = { _id: accountId };

    if (amount < 0) {
      filter.amount = { $gte: amount * -1 };
    }

    return filter;
  }

  public validatePostUpdateAmount(
    updatedDocument: IAccountDocument | null
  ): void {
    if (!updatedDocument) {
      throw new UserError(
        'Saldo insuficiente para realizar esta operação',
        StatusCodes.BadRequest
      );
    }
  }
}
