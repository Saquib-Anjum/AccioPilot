import type { Handler } from "express";
export const requireCsrf: Handler = (_request, _response, next) => next();
