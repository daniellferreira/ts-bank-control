import { StatusCodes } from '@src/enums/status-codes';

export class UserError extends Error {
  constructor(
    public message: string,
    public statusCode: StatusCodes = StatusCodes.BadRequest,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
