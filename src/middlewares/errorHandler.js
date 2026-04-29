export function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  console.error("[ERROR]", err.message);
  if (isDev) console.error(err.stack);

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
}

export function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}