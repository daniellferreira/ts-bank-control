import { UserError } from '@src/errors/user-error';
import { StatusCodes } from '@src/enums/status-codes';
import { IAccountDocument } from '@src/models/account';
import { AccountService } from '@src/services/account';

describe('AccountService tests', () => {
  let service: AccountService;

  beforeEach(() => {
    service = new AccountService();
  });

  it('should build a filter condition successfully with positive amount', () => {
    const accountId = '123456';
    const amount = 10;
    const filter = service.buildUpdateFilter(accountId, amount);

    expect(filter).toStrictEqual({ _id: accountId });
  });

  it('should build a filter condition successfully with negative amount', () => {
    const accountId = '123456';
    const amount = -10;
    const filter = service.buildUpdateFilter(accountId, amount);

    expect(filter).toStrictEqual({ _id: accountId, amount: { $gte: 10 } });
  });

  it('should validate if document was updated and not throw any error', () => {
    const mockDocument = {} as jest.Mocked<IAccountDocument>;

    expect(() => {
      service.validatePostUpdateAmount(mockDocument);
    }).not.toThrowError();
  });

  it('should validate if document was updated and throw a UserError cause document was not passed', () => {
    try {
      service.validatePostUpdateAmount(null);
    } catch (err) {
      expect(err).toBeInstanceOf(UserError);
      expect(err).toHaveProperty(
        'message',
        'Saldo insuficiente para realizar esta operação'
      );
      expect(err).toHaveProperty('statusCode', StatusCodes.BadRequest);
    }
  });
});
