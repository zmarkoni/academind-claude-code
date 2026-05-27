import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const { POST: authPost, GET: authGet } = toNextJsHandler(auth);

function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  return authPost(request);
}

export async function GET(request: Request) {
  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  return authGet(request);
}
