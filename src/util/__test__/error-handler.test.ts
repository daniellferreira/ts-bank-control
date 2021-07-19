import { StatusCodes, UserError } from '@src/errors/user-error';
import { ErrorHandler } from '@src/util/error-handler';
import { getMockReq, getMockRes } from '@jest-mock/express';
import mongoose from 'mongoose';

describe('ErrorHandler tests', () => {
  const req = getMockReq();
  const { res, next, mockClear } = getMockRes();

  beforeEach(() => {
    mockClear(); // can also use clearMockRes()
  });

  it('should handle a error without basic information and to respond unexpected with defaults', () => {
    const err = new Error() as UserError;

    ErrorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BadRequest);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Erro desconhecido',
        type: 'Error',
      })
    );
  });

  it('should handle a Mongo ValidationError successfully with a recognized kind of error', () => {
    const err = new mongoose.Error.ValidationError('');

    err.errors = {
      abc: { message: 'Field abc is required', kind: 'required' },
    } as unknown as { [key: string]: mongoose.Error.ValidatorError };

    ErrorHandler(err as unknown as UserError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BadRequest);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Existem erros de validação:\n- Campo abc é obrigatório',
        type: 'ValidationError',
      })
    );
  });

  it('should handle a Mongo ValidationError successfully with a unrecognized kind of error', () => {
    const err = new mongoose.Error.ValidationError('');

    err.errors = {
      abc: { message: 'Campo abc está inválido', kind: 'different_kind' },
      def: { message: 'Campo def está inválido', kind: 'different_kind' },
    } as unknown as { [key: string]: mongoose.Error.ValidatorError };

    ErrorHandler(err as unknown as UserError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BadRequest);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Existem erros de validação:\n- Campo abc está inválido\n- Campo def está inválido',
        type: 'ValidationError',
      })
    );
  });

  it('should handle a CastError successfully', () => {
    const err = new mongoose.Error.CastError('', '12313123', 'id');

    ErrorHandler(err as unknown as UserError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NotFound);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Registro não encontrado com id: 12313123',
        type: 'CastError',
      })
    );
  });
});
