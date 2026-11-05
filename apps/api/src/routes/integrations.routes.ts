import { Router } from "express";
export const integrationsRouter = Router();
integrationsRouter.post("/telegram/link", (_request, response) => response.status(501).json({ error: { code: "TELEGRAM_NOT_CONFIGURED", message: "Telegram integration is not configured" } }));
integrationsRouter.delete("/telegram", (_request, response) => response.status(204).json({}));
