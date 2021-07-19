import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Environment } from '@src/services/config';
import { StatusCodes, UserError } from '@src/errors/user-error';

const detailFieldErrorByKind: { [key: string]: string } = {
  unexpected: 'Erro desconhecido',
  required: 'Campo %s é obrigatório',
};

class HandlerError extends UserError {
  keyPattern: any;
}

export const ErrorHandler = (
  err: HandlerError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const details = new Map<string, string>();

  if (!err.statusCode) {
    err.statusCode = StatusCodes.BadRequest;
  }

  if (!err.message) {
    err.message = detailFieldErrorByKind.unexpected;
  }

  if (err instanceof mongoose.Error.ValidationError && err.errors) {
    const messages: string[] = Object.keys(err.errors).map((fieldName) => {
      const error = err.errors[fieldName] as mongoose.Error.ValidatorError;

      return (
        detailFieldErrorByKind[error?.kind] || err.errors[fieldName]?.message
      );
    });

    err.message = 'Existem erros de validação:\n- ' + messages.join('\n-');
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

  res.status(err.statusCode).json({
    message: err.message,
    type: err.name,
    errors: details.size > 0 ? Object.fromEntries(details) : undefined,
    original_error:
      process.env.NODE_ENV === Environment.DEVELOPMENT ? err : undefined,
  });
};
