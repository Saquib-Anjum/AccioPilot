import { Router } from "express";
export const authRouter = Router();
authRouter.get("/github/start", (_request, response) => response.status(501).json({ error: { code: "GITHUB_AUTH_NOT_CONFIGURED", message: "GitHub OAuth is not configured" } }));
authRouter.post("/logout", (_request, response) => response.status(204).json({}));
