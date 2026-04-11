export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Une erreur interne est survenue.";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({ message });
}

