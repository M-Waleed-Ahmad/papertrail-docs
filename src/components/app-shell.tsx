"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppShell({ children, userName, compact = false }: { children: React.ReactNode; userName: string; compact?: boolean }) {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className={compact ? "app-shell compact" : "app-shell"}>
      <header className="topbar">
        <Link className="wordmark" href="/dashboard">Papertrail</Link>
        <div className="account-menu"><span>{userName}</span><button className="text-button" onClick={signOut}>Sign out</button></div>
      </header>
      {children}
    </div>
  );
}
