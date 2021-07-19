import testConfig from '@test/config';
import { StatusCodes } from '@src/enums/status-codes';
import { Finance, IFinanceDocument } from '@src/models/finance';
import { AccountService } from '@src/services/account';
import { FinanceService } from '@src/services/finance';
import { UserError } from '@src/errors/user-error';
import { Account } from '@src/models/account';

describe('Account functional tests', () => {
  let accountId: string;
  beforeAll(async () => {
    const service = new AccountService();
    accountId = (await service.getCreatedAccount()).id;
  });

  beforeEach(async () => {
    await Finance.deleteMany({});
    await Account.updateOne({ _id: accountId }, { amount: 0 });
  });

  it('should get empty account history', async () => {
    const resp = await testConfig.requester
      ?.get(`/finance/${accountId}`)
      .send();

    const history: IFinanceDocument[] = resp?.body;

    expect(resp?.status).toBe(StatusCodes.OK);
    expect(history).toStrictEqual([]);
  });

  it('should make a deposit and return it in history get', async () => {
    const respDeposit = await testConfig.requester
      ?.post('/finance/deposit')
      .send({ account_id: accountId, amount: 250 });

    const respHistory = await testConfig.requester
      ?.get(`/finance/${accountId}`)
      .send();

    const history: IFinanceDocument[] = respHistory?.body;

    expect(respDeposit?.status).toBe(StatusCodes.OK);
    expect(respDeposit?.body).toStrictEqual({});
    expect(respHistory?.status).toBe(StatusCodes.OK);
    expect(history).toHaveLength(1);
    expect(history).toContainEqual(
      expect.objectContaining({
        type: 'in',
        amount: 250,
      })
    );
  });

  it('should not get history cause an error', async () => {
    jest
      .spyOn(FinanceService.prototype, 'getHistory')
      .mockRejectedValueOnce(new UserError('ERROR', StatusCodes.Semantic));

    const resp = await testConfig.requester
      ?.get(`/finance/${accountId}`)
      .send();

    expect(resp?.status).toBe(StatusCodes.Semantic);
    expect(resp?.body?.message).toBe('ERROR');
  });

  it('should not make a draft and cause insufficient amount in account and not affect account amount', async () => {
    const respAccountBefore = await testConfig.requester
      ?.get('/account')
      .send();

    const respDraft = await testConfig.requester
      ?.post('/finance/draft')
      .send({ account_id: accountId, amount: 300 });

    const respAccountAfter = await testConfig.requester?.get('/account').send();

    const respHistory = await testConfig.requester
      ?.get(`/finance/${accountId}`)
      .send();

    const history: IFinanceDocument[] = respHistory?.body;

    expect(respDraft?.status).toBe(StatusCodes.BadRequest);
    expect(respDraft?.body?.message).toBe(
      'Saldo insuficiente para realizar esta operação'
    );
    expect(respHistory?.status).toBe(StatusCodes.OK);
    expect(history).toStrictEqual([]);
    expect(respAccountBefore?.body?.amount).toBe(
      respAccountAfter?.body?.amount
    );
  });

  it('should make a draft, return operations in history get and affect account amount', async () => {
    const respDeposit = await testConfig.requester
      ?.post('/finance/deposit')
      .send({ account_id: accountId, amount: 250 });

    const respDraft = await testConfig.requester
      ?.post('/finance/draft')
      .send({ account_id: accountId, amount: 50 });

    const respHistory = await testConfig.requester
      ?.get(`/finance/${accountId}`)
      .send();

    const respAccount = await testConfig.requester?.get('/account').send();

    const history: IFinanceDocument[] = respHistory?.body;

    expect(respDeposit?.status).toBe(StatusCodes.OK);
    expect(respDeposit?.body).toStrictEqual({});
    expect(respDraft?.status).toBe(StatusCodes.OK);
    expect(respDraft?.body).toStrictEqual({});
    expect(respHistory?.status).toBe(StatusCodes.OK);
    expect(respAccount?.body?.amount).toBe(200);
    expect(history).toHaveLength(2);
    expect(history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'in',
          amount: 250,
        }),
        expect.objectContaining({
          type: 'out',
          amount: 50,
        }),
      ])
    );
  });

  it('should make a ticket payment, return operations in history get and affect account amount', async () => {
    const respDeposit = await testConfig.requester
      ?.post('/finance/deposit')
      .send({ account_id: accountId, amount: 250 });

    const respPayment = await testConfig.requester
      ?.post('/finance/payment/ticket')
      .send({
        account_id: accountId,
        amount: 23.87,
        ticket_code: '20032321567897987987987200323215678979879879871',
      });

    const respHistory = await testConfig.requester
      ?.get(`/finance/${accountId}`)
      .send();

    const respAccount = await testConfig.requester?.get('/account').send();

    const history: IFinanceDocument[] = respHistory?.body;

    expect(respDeposit?.status).toBe(StatusCodes.OK);
    expect(respDeposit?.body).toStrictEqual({});
    expect(respPayment?.status).toBe(StatusCodes.OK);
    expect(respPayment?.body).toStrictEqual({});
    expect(respHistory?.status).toBe(StatusCodes.OK);
    expect(respAccount?.body?.amount).toBe(226.13);
    expect(history).toHaveLength(2);
    expect(history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'in',
          amount: 250,
        }),
        expect.objectContaining({
          type: 'payment_ticket',
          amount: 23.87,
          ticketCode: '20032321567897987987987200323215678979879879871',
        }),
      ])
    );
  });

  it('should not make a ticket payment cause invalid ticket_code and not affect account amount', async () => {
    const respDeposit = await testConfig.requester
      ?.post('/finance/deposit')
      .send({ account_id: accountId, amount: 50.34 });

    const respAccountBefore = await testConfig.requester
      ?.get('/account')
      .send();

    const respPayment = await testConfig.requester
      ?.post('/finance/payment/ticket')
      .send({
        account_id: accountId,
        amount: 23.87,
        ticket_code: '1234',
      });

    const respAccountAfter = await testConfig.requester?.get('/account').send();

    const respHistory = await testConfig.requester
      ?.get(`/finance/${accountId}`)
      .send();

    const history: IFinanceDocument[] = respHistory?.body;

    expect(respDeposit?.status).toBe(StatusCodes.OK);
    expect(respDeposit?.body).toStrictEqual({});
    expect(respPayment?.status).toBe(StatusCodes.BadRequest);
    expect(respPayment?.body?.message).toBe(
      'Existem erros de validação:\n- Linha digitável deve ter 47 caracteres'
    );
    expect(respHistory?.status).toBe(StatusCodes.OK);
    expect(history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'in',
          amount: 50.34,
        }),
      ])
    );
    expect(respAccountBefore?.body?.amount).toBe(
      respAccountAfter?.body?.amount
    );
  });

  it('should not make a deposit cause any error and not affect account amount', async () => {
    jest
      .spyOn(FinanceService.prototype, 'moneyIn')
      .mockRejectedValueOnce(new UserError('ERROR', StatusCodes.Semantic));

    const respAccountBefore = await testConfig.requester
      ?.get('/account')
      .send();

    const respDeposit = await testConfig.requester
      ?.post('/finance/deposit')
      .send({ account_id: accountId, amount: 250 });

    const respAccountAfter = await testConfig.requester?.get('/account').send();

    expect(respDeposit?.status).toBe(StatusCodes.Semantic);
    expect(respDeposit?.body?.message).toBe('ERROR');
    expect(respAccountBefore?.body?.amount).toBe(
      respAccountAfter?.body?.amount
    );
  });
});
