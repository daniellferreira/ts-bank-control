import { StatusCodes, UserError } from '@src/errors/user-error';
import { Account } from '@src/models/account';
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
    const filter: UpdateAmountFilter = { _id: accountId };

    if (amount < 0) {
      filter.amount = { $gte: amount * -1 };
    }

    const updatedAccount = await Account.findOneAndUpdate(
      filter,
      { $inc: { amount } },
      { runValidators: true, new: true, session }
    );

    if (!updatedAccount) {
      throw new UserError(
        'Saldo insuficiente para realizar esta operação',
        StatusCodes.BadRequest
      );
    }

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
}
