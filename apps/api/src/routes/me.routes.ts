import { Router } from "express";
import { currentUserId } from "../middleware/authenticate-user.js";
export const meRouter = Router();
meRouter.get("/", (request, response) => response.json({ id: currentUserId(request), displayName: "Local User" }));
