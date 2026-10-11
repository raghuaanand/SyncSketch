import { Prisma } from "@unfold/db";
import { ZodError, ZodType } from "zod";

// Vercel functions reject request bodies above 4.5 MB.
export const MAX_BODY_BYTES = 4_000_000;

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = () => new HttpError(404, "Not found");

// Wraps a route handler: maps thrown errors to JSON responses.
export function handle<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof Response) return err; // e.g. 401 from requireUser()
      if (err instanceof HttpError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return Response.json(
          { error: "Invalid input", issues: err.issues },
          { status: 400 },
        );
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      console.error(err);
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  };
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new HttpError(413, "Board is too large to save (limit ~4 MB)");
  }
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new HttpError(400, "Body must be valid JSON");
  }
  return schema.parse(json);
}
