export enum StatusCodes {
  // 2XX:
  OK = 200,
  Created = 201,
  // 4XX:
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  Conflict = 409,
  Semantic = 422,
  // 5XX:
  InternalServerError = 500,
}
