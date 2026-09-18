// Central error handler - catches thrown errors and mongoose validation errors
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || { field: 1 })[0];
    return res.status(409).json({ message: `Duplicate value for field: ${field}` });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Server error' });
};

module.exports = errorHandler;
