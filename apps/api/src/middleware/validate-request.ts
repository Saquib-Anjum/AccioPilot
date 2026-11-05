import type { Handler } from "express";
export const validateRequest = (_schema: unknown): Handler => (_request, _response, next) => next();
