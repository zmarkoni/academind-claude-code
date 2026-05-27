import { AuthForm } from "./auth-form";

export default async function AuthenticatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <AuthForm isSignUp={mode === "signup"} />;
}
