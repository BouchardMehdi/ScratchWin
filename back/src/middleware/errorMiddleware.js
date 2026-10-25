export function errorHandler(error, req, res, next) {
  const candidate = error.statusCode || error.status;
  const statusCode = Number.isInteger(candidate) && candidate >= 400 && candidate <= 599 ? candidate : 500;
  const message = statusCode >= 500
    ? "Une erreur interne est survenue. Reessaie dans un instant."
    : error.type === "entity.parse.failed"
      ? "Le corps JSON est invalide."
      : error.message || "Requete invalide.";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({ message });
}

