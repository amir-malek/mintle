const DEFAULT_ERRORS = {
  BAD_TOKEN: {
    code: 'BAD_TOKEN',
    message: 'Token is not valid',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Token expired',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Invalid credentials',
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Internal server error',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Not found',
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Bad request',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Permission denied',
  },
  VALIDATION: {
    code: 'VALIDATION',
    message: 'Validation error',
  },
};

/**
 * @function BaseError
 * @param {number} statusCode - HTTP status code
 * @param {boolean} isOperational - Is this error operational
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param fields
 */
function BaseError(message, statusCode, type, isOperational, fields = undefined) {
  const error = new Error(message);
  error.type = type;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  error.isApiError = true;
  error.fields = fields;
  error.code = 0;
  return error;
}

/**
 * @function ApiError
 */
function ApiError(message, statusCode, type, fields = undefined) {
  const error = BaseError(message, statusCode, type, true, fields);
  return error;
}

/**
 * Check if error is an api specific error
 * @param {Error} err - Error object
 * @returns {boolean} - Is this error an ApiError
 */
function IsApiError(err) {
  return (err.isApiError ? err.isOperational : false);
}

function NotFoundError(
  message = DEFAULT_ERRORS.NOT_FOUND.message,
  type = DEFAULT_ERRORS.NOT_FOUND.code,
) {
  return ApiError(message, 404, type);
}

function BadRequestError(
  message = DEFAULT_ERRORS.BAD_REQUEST.message,
  type = DEFAULT_ERRORS.BAD_REQUEST.code,
) {
  return ApiError(message, 400, type);
}

function ValidationError(
  message = DEFAULT_ERRORS.VALIDATION.message,
  type = DEFAULT_ERRORS.VALIDATION.code,
) {
  return ApiError(message, 400, type);
}

function FormValidationError(
  e,
  message = DEFAULT_ERRORS.VALIDATION.message,
  type = DEFAULT_ERRORS.VALIDATION.code,
) {
  const errors = e.inner;

  const fieldErrors = {};
  for (let i = 0; i < errors.length; i++) {
    fieldErrors[errors[i].path] = errors[i].message;
  }

  return ApiError(message, 400, type, fieldErrors);
}

function UnauthorizedError(
  message = DEFAULT_ERRORS.UNAUTHORIZED.message,
  type = DEFAULT_ERRORS.UNAUTHORIZED.code,
) {
  return ApiError(message, 401, type);
}

function ForbiddenError(
  message = DEFAULT_ERRORS.FORBIDDEN.message,
  type = DEFAULT_ERRORS.FORBIDDEN.code,
) {
  return ApiError(message, 403, type);
}

function InternalServerError(
  message = DEFAULT_ERRORS.SERVER_ERROR.message,
  type = DEFAULT_ERRORS.SERVER_ERROR.code,
) {
  return ApiError(message, 500, type);
}

function BadTokenError(
  message = DEFAULT_ERRORS.BAD_TOKEN.message,
  type = DEFAULT_ERRORS.BAD_TOKEN.code,
) {
  return ApiError(message, 401, type);
}

function TokenExpiredError(
  message = DEFAULT_ERRORS.TOKEN_EXPIRED.message,
  type = DEFAULT_ERRORS.TOKEN_EXPIRED.code,
) {
  return ApiError(message, 401, type);
}

module.exports = {
  IsApiError,
  NotFoundError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  FormValidationError,
  ForbiddenError,
  InternalServerError,
  BadTokenError,
  TokenExpiredError,
};
