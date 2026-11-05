declare module "express" {
  export interface Request { body: unknown; query: Record<string, string | string[] | undefined>; params: Record<string, string>; header(name: string): string | undefined; }
  export interface Response { status(code: number): Response; json(body: unknown): Response; }
  export type NextFunction = (error?: unknown) => void;
  export type Handler = (request: Request, response: Response, next: NextFunction) => unknown;
  export interface Router { use(handler: Handler | unknown): Router; get(path: string, handler: Handler): Router; post(path: string, handler: Handler): Router; delete(path: string, handler: Handler): Router; }
  export interface Application { use(path: string, handler: Router | Handler): Application; use(handler: Handler | Router | unknown): Application; get(path: string, handler: Handler): Application; post(path: string, handler: Handler): Application; listen(port: number, callback?: () => void): unknown; }
  export default function express(): Application;
  export function json(options?: { limit?: string }): Handler;
  export function Router(): Router;
}
