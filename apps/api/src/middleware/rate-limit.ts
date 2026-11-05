import type { Handler } from "express";
export const rateLimit = (_name: string): Handler => (_request, _response, next) => next();
