/* eslint-disable no-unused-vars */
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const payload = { message: err.message || 'Internal server error' };
  if (err.errors) payload.errors = err.errors;
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
