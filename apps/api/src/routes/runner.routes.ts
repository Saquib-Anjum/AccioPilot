import { Router } from "express";
export const runnerRouter = Router();
runnerRouter.post("/heartbeat", (_request, response) => response.status(501).json({ error: { code: "RUNNER_NOT_CONFIGURED", message: "Runner authentication is not configured" } }));
