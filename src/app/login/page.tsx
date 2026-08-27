import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="wordmark">Papertrail</p>
        <h1>Shared writing, without the clutter.</h1>
        <p className="muted">Sign in with one of the prepared reviewer accounts to explore the workspace.</p>
        <LoginForm />
      </section>
    </main>
  );
}
