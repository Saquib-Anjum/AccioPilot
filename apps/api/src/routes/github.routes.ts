import { Router } from "express";
export const githubRouter = Router();
githubRouter.get("/repositories", (_request, response) => response.status(501).json({ error: { code: "GITHUB_NOT_CONFIGURED", message: "GitHub integration is not configured" } }));
