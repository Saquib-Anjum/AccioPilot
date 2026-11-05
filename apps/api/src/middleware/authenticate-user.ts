import type { Handler } from "express";

export const authenticateUser: Handler = (request, _response, next) => {
  // Temporary local identity until the GitHub session middleware is connected.
  if (!request.header("x-user-id"))
    request.header = ((name: string) =>
      name.toLowerCase() === "x-user-id"
        ? "local-user"
        : undefined) as typeof request.header;
  next();
};

export const currentUserId = (request: {
  header(name: string): string | undefined;
}): string => request.header("x-user-id")?.trim() || "local-user";
