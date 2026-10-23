import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Rate limiting is handled by better-auth's built-in limiter (see lib/auth.ts).
export const { POST, GET } = toNextJsHandler(auth);
