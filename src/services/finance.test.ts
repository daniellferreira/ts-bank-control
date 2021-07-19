import { UserError } from '@src/errors/user-error';
import { StatusCodes } from '@src/enums/status-codes';
import { FinanceService } from '@src/services/finance';

describe('FinanceService tests', () => {
  let service: FinanceService;

  beforeEach(() => {
    service = new FinanceService();
  });

  it('should validate that ticket code is not empty and not throw any error', () => {
    expect(() => {
      service.validateTicketCode('23123123131312');
    }).not.toThrowError();
  });

  it('should validate that ticket code is empty and throw a UserError cause cannot be empty', () => {
    try {
      service.validateTicketCode(undefined);
    } catch (err) {
      expect(err).toBeInstanceOf(UserError);
      expect(err).toHaveProperty(
        'message',
        'Campo Linha Digitável é obrigatório para realizar um pagamento'
      );
      expect(err).toHaveProperty('statusCode', StatusCodes.BadRequest);
    }
  });
});
