import { ValidationError } from 'express-validator'

export type ApiErrorProps = {
  status: number
  errors: ValidationError[]
}

export class ApiError extends Error implements ApiErrorProps {
  status: number
  message: string
  errors: ValidationError[]

  constructor(
    status: number,
    message: string,
    errors: ValidationError[] = []
  ) {
    super(message)

    this.status = status
    this.errors = errors
    this.message = message
  }

  static UnauthorizedError() {
    return new ApiError(401, 'User unauthorized')
  }

  static BadRequest(message: string, errors?: ValidationError[]) {
    return new ApiError(400, message, errors)
  }
}
