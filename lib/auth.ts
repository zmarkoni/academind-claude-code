import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/lib/db";

// better-auth 1.6 reads the client IP from the first x-forwarded-for value by default, which
// clients can spoof. Behind a proxy, set TRUSTED_IP_HEADER to a header that proxy overwrites.
const trustedIpHeader = process.env.TRUSTED_IP_HEADER;

export const auth = betterAuth({
  database: getDb(),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  // Keyed by IP + path; sign-in/sign-up are capped at 3 requests per 10s by default.
  // Enabled explicitly because better-auth turns it off in development.
  rateLimit: {
    enabled: true,
  },
  advanced: trustedIpHeader
    ? { ipAddress: { ipAddressHeaders: [trustedIpHeader] } }
    : undefined,
  plugins: [nextCookies()],
});
