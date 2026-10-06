"use client";

import { useState } from "react";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { Input, Button } from "@/components/ui/primitives";
import { apiGet } from "@/lib/api";

export default function VerifyPage() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");
    try {
      const data = await apiGet<{ studentName: string }>(`/certificates/verify/${encodeURIComponent(id.trim())}`);
      setResult(`Verified: ${data.studentName}`);
    } catch {
      setResult("Certificate not found. Check the ID and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section>
      <Container>
        <SectionHeading title="Verify certificate" subtitle="Enter the certificate ID printed on the certificate." />
        <Card>
          <form onSubmit={lookup} className="grid gap-4">
            <Input id="cert-id" label="Certificate ID" value={id} onChange={(e) => setId(e.target.value)} required />
            <Button type="submit" disabled={loading}>{loading ? "Checking…" : "Verify"}</Button>
          </form>
          {result ? <p className="mt-4 font-semibold text-primary" role="status">{result}</p> : null}
        </Card>
      </Container>
    </Section>
  );
}
