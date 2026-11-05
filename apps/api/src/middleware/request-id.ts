import type { Handler } from "express";
export const requestId: Handler = (_request, _response, next) => next();
