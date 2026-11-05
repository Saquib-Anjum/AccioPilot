import type { Handler } from "express";
export const notFound: Handler = (_request, response) =>
  response
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Route not found" } });
export const errorHandler: Handler = (_error, _request, response) =>
  response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
