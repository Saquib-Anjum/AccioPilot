declare module "express" {
  interface Request { body: unknown; query: Record<string, string | string[] | undefined>; params: Record<string, string>; header(name: string): string | undefined; }
  interface Response { status(code: number): Response; json(body: unknown): Response; }
  type NextFunction = (error?: unknown) => void;
  type Handler = (request: Request, response: Response, next: NextFunction) => unknown;
  interface Application { use(handler: Handler | unknown): Application; get(path: string, handler: Handler): Application; post(path: string, handler: Handler): Application; listen(port: number, callback?: () => void): unknown; }
  export default function express(): Application;
  export function json(options?: { limit?: string }): Handler;
}
