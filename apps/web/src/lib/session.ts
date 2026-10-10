import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// For route handlers: returns the signed-in user or throws a 401 Response.
export async function requireUser() {
  const session = await getSession();
  if (!session) {
    throw Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session.user;
}
