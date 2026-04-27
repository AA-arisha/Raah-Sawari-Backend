export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  console.error("🔥 ERROR:", err);

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  // production
  return res.status(err.statusCode).json({
    success: false,
    message: err.isOperational
      ? err.message
      : "Something went wrong",
  });
};