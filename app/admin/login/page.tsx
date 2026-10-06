"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Section, Card, Button, Input } from "@/components/ui/primitives";
import { adminPost } from "@/lib/admin-client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminPost("/auth/login", { email, password });
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section>
      <Container>
        <Card className="mx-auto max-w-md">
          <h1 className="font-heading text-2xl font-bold text-ink">Admin login</h1>
          <p className="mb-4 mt-1 text-sm text-muted">No public sign-up. Use your counselor or manager account.</p>
          <form onSubmit={submit} className="grid gap-4">
            <Input id="al-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input id="al-pass" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
            <Button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </form>
        </Card>
      </Container>
    </Section>
  );
}
