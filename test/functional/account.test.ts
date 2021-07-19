import testConfig from '@test/config';
import { Account } from '@src/models/account';
import { StatusCodes } from '@src/enums/status-codes';
import { AccountService } from '@src/services/account';
import { UserError } from '@src/errors/user-error';

describe('Account functional tests', () => {
  beforeEach(async () => {
    await Account.deleteMany({});
  });

  it('should create a new account and return it', async () => {
    const resp = await testConfig.requester?.get('/account').send();
    const accountId = resp?.body?.id;

    expect(resp?.status).toBe(StatusCodes.OK);
    expect(typeof accountId).toBe('string');
    expect(accountId).not.toBe('');
  });

  it('should get a previously created account', async () => {
    const creationResp = await testConfig.requester?.get('/account').send();
    const accountId = creationResp?.body?.id;

    const getResp = await testConfig.requester?.get('/account').send();

    expect(getResp?.status).toBe(StatusCodes.OK);
    expect(getResp?.body?.id).toBe(accountId);
  });

  it('should throw error in get request and handle correctly the error', async () => {
    jest
      .spyOn(AccountService.prototype, 'getCreatedAccount')
      .mockImplementationOnce((): any =>
        Promise.reject(new UserError('ERROR', StatusCodes.Semantic))
      );

    const resp = await testConfig.requester?.get('/account').send();

    expect(resp?.status).toBe(StatusCodes.Semantic);
    expect(resp?.body?.message).toBe('ERROR');
  });
});
