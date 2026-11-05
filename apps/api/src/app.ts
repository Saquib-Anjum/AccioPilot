import express from "express";
import { authenticateUser } from "./middleware/authenticate-user.js";
import { notFound } from "./middleware/error-handler.js";
import { requestId } from "./middleware/request-id.js";
import { authRouter } from "./routes/auth.routes.js";
import { githubRouter } from "./routes/github.routes.js";
import { integrationsRouter } from "./routes/integrations.routes.js";
import { meRouter } from "./routes/me.routes.js";
import { projectsRouter } from "./routes/projects.routes.js";
import { runnerRouter } from "./routes/runner.routes.js";
import { tasksRouter } from "./routes/tasks.routes.js";
import { MemoryStore } from "./store.js";

export function createApiApp(store = new MemoryStore()) {
  const app = express();
  app.use(express.json({ limit: "64kb" }));
  app.use(requestId);
  app.use(authenticateUser);
  app.use("/auth", authRouter);
  app.use("/api/v1/me", meRouter);
  app.use("/api/v1/github", githubRouter);
  app.use("/api/v1/projects", projectsRouter(store));
  app.use("/api/v1/tasks", tasksRouter(store));
  app.use("/api/v1/integrations", integrationsRouter);
  app.use("/api/v1/runner", runnerRouter);
  app.use(notFound);
  return app;
}
