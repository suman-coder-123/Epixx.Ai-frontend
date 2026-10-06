"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Container, Section } from "@/components/ui/primitives";
import { useMe } from "@/lib/useAdmin";
import { adminPost } from "@/lib/admin-client";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/trainers", label: "Trainers" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/posts", label: "Blog" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/users", label: "Team", roles: ["SuperAdmin"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { me, loading, reload } = useMe();

  // Re-check the session on every admin navigation. Without this, logging in
  // (which navigates without remounting this layout) keeps the stale logged-out
  // state and bounces the user straight back to /admin/login.
  useEffect(() => {
    if (path !== "/admin/login") void reload();
  }, [path, reload]);

  useEffect(() => {
    if (path !== "/admin/login" && !loading && !me) router.replace("/admin/login");
  }, [loading, me, path, router]);

  if (path === "/admin/login") return <>{children}</>;
  if (loading || !me) {
    return (
      <Section><Container><p className="text-muted">Checking session…</p></Container></Section>
    );
  }

  const logout = async () => {
    await adminPost("/auth/logout", {}).catch(() => null);
    router.replace("/admin/login");
  };

  return (
    <div className="bg-tint/40">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-5 py-8 md:px-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-white p-4">
            <p className="px-2 font-heading text-sm font-bold text-primary">Epixx Admin</p>
            <p className="px-2 text-xs text-muted">{me.email} · {me.role}</p>
            <nav aria-label="Admin" className="mt-3 grid gap-1">
              {NAV.filter((n) => !n.roles || n.roles.includes(me.role)).map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ${path === n.href ? "bg-tint text-primary" : "text-ink hover:bg-tint/60"}`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <button onClick={logout} className="mt-3 w-full rounded-xl px-3 py-2 text-left text-sm text-muted hover:bg-tint/60">
              Log out
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <nav aria-label="Admin mobile" className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {NAV.filter((n) => !n.roles || n.roles.includes(me.role)).map((n) => (
              <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm text-primary shadow-sm">
                {n.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
