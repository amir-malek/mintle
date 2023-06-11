const { IsApiError } = require('../utils/ApiError');

// const currentEnv = process.env.NODE_ENV || 'development';
/**
 * Global error handler for all routes
 * @param {ApiError} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports = (err, _req, res, next) => {
  if (res.headersSent) return next(err);
  if (IsApiError(err)) {
    return res.status(err.statusCode)
      .send({
        ...err,
        message: err.message,
      });
  }
  // if (currentEnv === 'development' || currentEnv === 'test') {
  return res.status(500)
    .send({
      ...err,
      message: err.message,
    });
  // }
  // return res.status(500)
  //   .send({
  //     message: err.message,
  //     code: 0,
  //   });
};
