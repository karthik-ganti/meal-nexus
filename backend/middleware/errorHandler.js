const crypto = require('crypto');

const ERROR_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  500: 'INTERNAL_ERROR',
};

module.exports = (err, req, res, next) => {
  const requestId = req.requestId || crypto.randomUUID();
  const status = err.status || err.statusCode || 500;
  console.error(`[${requestId}] ${err.stack || err.message}`);
  res.status(status).json({
    error: {
      code: err.code || ERROR_CODES[status] || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong',
      requestId,
    },
  });
};
