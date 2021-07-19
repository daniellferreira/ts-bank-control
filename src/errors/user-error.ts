export enum StatusCodes {
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  Conflict = 409,
  Semantic = 422,
  InternalServerError = 500,
}

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
