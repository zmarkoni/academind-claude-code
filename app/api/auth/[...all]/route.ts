import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const { POST: authPost, GET: authGet } = toNextJsHandler(auth);

function tooManyRequests() {
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: { "Content-Type": "application/json" },
  });
}

// Forwarding headers are client-controlled unless a trusted reverse proxy overwrites them,
// so the client IP is only used when TRUST_PROXY=true.
async function getClientIp(): Promise<string | null> {
  if (process.env.TRUST_PROXY !== "true") {
    return null;
  }
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headersList.get("x-real-ip");
}

// Without a trusted proxy, credential attempts are limited per account instead of one
// bucket shared by all clients, which would let anyone lock everybody out.
async function getEmailKey(request: Request): Promise<string | null> {
  try {
    const body = await request.clone().json();
    return typeof body?.email === "string"
      ? `email:${body.email.trim().toLowerCase()}`
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const key = (await getClientIp()) ?? (await getEmailKey(request));

  if (key && !checkRateLimit(key)) {
    return tooManyRequests();
  }

  return authPost(request);
}

export async function GET(request: Request) {
  // GET carries no credentials (session lookups, callbacks), so it is only limited per IP
  // behind a trusted proxy.
  const key = await getClientIp();

  if (key && !checkRateLimit(key)) {
    return tooManyRequests();
  }

  return authGet(request);
}
