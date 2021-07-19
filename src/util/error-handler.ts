import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Environment } from '@src/services/config';
import { UserError } from '@src/errors/user-error';
import { StatusCodes } from '@src/enums/status-codes';

const detailFieldErrorByKind: { [key: string]: string } = {
  unexpected: 'Erro desconhecido',
  required: 'Campo %s é obrigatório',
};

export class HandlerError extends UserError {
  keyPattern?: any;
  code?: string | number | undefined;
}

export const ErrorHandler = (
  err: HandlerError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (!err.statusCode) {
    err.statusCode = StatusCodes.BadRequest;
  }

  if (!err.message) {
    err.message = detailFieldErrorByKind.unexpected;
  }

  if (err instanceof mongoose.Error.ValidationError && err.errors) {
    const messages: string[] = Object.keys(err.errors).map((fieldName) => {
      const error = err.errors[fieldName] as mongoose.Error.ValidatorError;

      if (detailFieldErrorByKind[error?.kind]) {
        let msg = detailFieldErrorByKind[error?.kind];
        return msg.replace('%s', fieldName);
      }

      return err.errors[fieldName]?.message;
    });

    err.message = 'Existem erros de validação:\n- ' + messages.join('\n- ');
  }

  if (err instanceof mongoose.mongo.MongoError && err.keyPattern) {
    const errorCode = parseInt(err.code as string, 10);
    const uniqeMongoErrorCodes = [11000, 11001];

    if (uniqeMongoErrorCodes.includes(errorCode)) {
      err.message =
        'Já existe um registro com o(s) mesmo(s) ' +
        Object.keys(err.keyPattern)
          .filter((f) => f !== 'account')
          .join(', ');
    }

    err.statusCode = StatusCodes.Conflict;
  }

  if (err instanceof mongoose.Error.CastError) {
    err.message = `Registro não encontrado com ${err.path.replace('_', '')}: ${
      err.value
    }`;
    err.statusCode = StatusCodes.NotFound;
  }

  res.status(err.statusCode).send({
    message: err.message,
    type: err.name,
    original_error:
      process.env.NODE_ENV === Environment.DEVELOPMENT ? err : undefined,
  });
};
