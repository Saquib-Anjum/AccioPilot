import express, { json as expressJson } from "express";
import {
  InvalidTransitionError,
  VersionConflictError,
} from "@acciopilot/domain";
import type { TaskStatus } from "@acciopilot/contracts";
import { MemoryStore } from "./store.js";
type Request = {
  body: unknown;
  query: Record<string, string | string[] | undefined>;
  params: Record<string, string>;
  header(name: string): string | undefined;
};
type Response = {
  status(code: number): Response;
  json(body: unknown): Response;
};
type NextFunction = (error?: unknown) => void;
export interface ApiApp {
  use(handler: unknown): ApiApp;
  get(path: string, handler: unknown): ApiApp;
  post(path: string, handler: unknown): ApiApp;
  listen(port: number, callback?: () => void): unknown;
}

const userId = (request: Request): string =>
  request.header("x-user-id")?.trim() || "local-user";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const stringField = (body: Record<string, unknown>, key: string): string => {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "")
    throw new Error(`INVALID_${key.toUpperCase()}`);
  return value.trim();
};
const errorCode = (error: unknown): string =>
  error instanceof VersionConflictError
    ? "VERSION_CONFLICT"
    : error instanceof InvalidTransitionError
      ? "INVALID_TRANSITION"
      : error instanceof Error
        ? error.message
        : "INTERNAL_ERROR";

export function createApiApp(store = new MemoryStore()): ApiApp {
  const app = express();
  app.use(expressJson({ limit: "64kb" }));
  app.get("/api/v1/me", (request, response) =>
    response.json({ id: userId(request), displayName: "Local User" }),
  );
  app.get("/api/v1/projects", (request, response) =>
    response.json({ projects: store.listProjects(userId(request)) }),
  );
  app.post("/api/v1/projects", (request, response) => {
    try {
      if (!isRecord(request.body)) throw new Error("INVALID_BODY");
      const repositoryId = stringField(request.body, "repositoryId");
      const input =
        typeof request.body.name === "string"
          ? { repositoryId, name: request.body.name }
          : { repositoryId };
      return response
        .status(201)
        .json({ project: store.createProject(userId(request), input) });
    } catch (error) {
      return response
        .status(400)
        .json({
          error: { code: errorCode(error), message: "Invalid project input" },
        });
    }
  });
  app.get("/api/v1/tasks", (request, response) =>
    response.json({
      tasks: store.listTasks(
        userId(request),
        typeof request.query.projectId === "string"
          ? request.query.projectId
          : undefined,
        typeof request.query.status === "string"
          ? (request.query.status as TaskStatus)
          : undefined,
      ),
    }),
  );
  app.post("/api/v1/tasks", (request, response) => {
    try {
      if (!isRecord(request.body)) throw new Error("INVALID_BODY");
      const task = store.createTask(userId(request), {
        projectId: stringField(request.body, "projectId"),
        title: stringField(request.body, "title"),
        instructions: stringField(request.body, "instructions"),
        acceptanceCriteria: Array.isArray(request.body.acceptanceCriteria)
          ? request.body.acceptanceCriteria.filter(
              (value): value is string => typeof value === "string",
            )
          : [],
        baseBranch:
          typeof request.body.baseBranch === "string"
            ? request.body.baseBranch
            : "main",
        agent:
          request.body.agent === "switch" || request.body.agent === "codex"
            ? request.body.agent
            : "mock",
      });
      return response.status(202).json({ task });
    } catch (error) {
      return response
        .status(400)
        .json({
          error: { code: errorCode(error), message: "Invalid task input" },
        });
    }
  });
  app.get("/api/v1/tasks/:taskId", (request, response) => {
    const task = store.getTask(userId(request), request.params.taskId!);
    return task
      ? response.json({ task })
      : response
          .status(404)
          .json({
            error: { code: "TASK_NOT_FOUND", message: "Task not found" },
          });
  });
  app.get("/api/v1/tasks/:taskId/events", (request, response) =>
    response.json({
      events: store.getEvents(
        userId(request),
        request.params.taskId!,
        Number(request.query.afterSequence ?? 0),
      ),
    }),
  );
  app.post("/api/v1/tasks/:taskId/cancel", (request, response) => {
    try {
      const task = store.transition(
        userId(request),
        request.params.taskId!,
        "cancelled",
        Number(
          isRecord(request.body) ? request.body.expectedVersion : undefined,
        ),
        userId(request),
      );
      return response.json({ task });
    } catch (error) {
      return response
        .status(errorCode(error) === "TASK_NOT_FOUND" ? 404 : 409)
        .json({
          error: {
            code: errorCode(error),
            message: "Task could not be cancelled",
          },
        });
    }
  });
  app.post("/api/v1/tasks/:taskId/approve", (request, response) => {
    try {
      if (!isRecord(request.body)) throw new Error("INVALID_BODY");
      const task = store.approve(
        userId(request),
        request.params.taskId!,
        Number(request.body.expectedVersion),
        userId(request),
        typeof request.body.comment === "string"
          ? request.body.comment
          : undefined,
      );
      return response.json({ task });
    } catch (error) {
      return response
        .status(errorCode(error) === "TASK_NOT_FOUND" ? 404 : 409)
        .json({
          error: {
            code: errorCode(error),
            message: "Task could not be approved",
          },
        });
    }
  });
  app.post("/api/v1/tasks/:taskId/reject", (request, response) => {
    try {
      if (!isRecord(request.body)) throw new Error("INVALID_BODY");
      const task = store.reject(
        userId(request),
        request.params.taskId!,
        Number(request.body.expectedVersion),
        userId(request),
        stringField(request.body, "comment"),
      );
      return response.json({ task });
    } catch (error) {
      return response
        .status(errorCode(error) === "TASK_NOT_FOUND" ? 404 : 409)
        .json({
          error: {
            code: errorCode(error),
            message: "Task could not be rejected",
          },
        });
    }
  });
  app.use((_request: Request, response: Response) =>
    response
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Route not found" } }),
  );
  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) =>
      response
        .status(500)
        .json({
          error: { code: "INTERNAL_ERROR", message: "Internal server error" },
        }),
  );
  return app;
}
