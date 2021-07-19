import { UserError } from '@src/errors/user-error';
import { StatusCodes } from '@src/enums/status-codes';

describe('UserError tests', () => {
  it('should build error with correct message', () => {
    const msg = 'ABC';
    const err = new UserError(msg);

    expect(err.message).toBe(msg);
  });

  it('should build error with default status code as BadRequest', () => {
    const err = new UserError('ABC');
    expect(err.statusCode).toBe(StatusCodes.BadRequest);
  });

  it('should build error with Unauthorized status code', () => {
    const err = new UserError('ABC', StatusCodes.Unauthorized);
    expect(err.statusCode).toBe(StatusCodes.Unauthorized);
  });
});
