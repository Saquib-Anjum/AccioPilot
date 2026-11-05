import type { Handler } from "express";
export const authenticateRunner: Handler = (request, response, next) =>
  request.header("authorization")
    ? next()
    : response.status(401).json({
        error: {
          code: "RUNNER_UNAUTHORIZED",
          message: "Runner authentication required",
        },
      });
