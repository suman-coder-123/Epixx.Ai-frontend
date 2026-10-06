"use client";

import { useState } from "react";
import { Card, Button, Input, Textarea } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPost, adminDel } from "@/lib/admin-client";
import { certificateSchema } from "@/lib/shared";

interface Certificate {
  _id: string; certificateId: string; studentName: string;
  course: { _id: string; title: string } | string; issueDate: string; grade?: string;
}

export default function CertificatesPage() {
  const { data, loading, error, reload } = useAdminFetch<{ items: Certificate[] }>(`/certificates?limit=100`);
  const { data: courses } = useAdminFetch<{ items: { _id: string; title: string; slug: string }[] }>(`/courses?limit=100`);
  const [single, setSingle] = useState({ certificateId: "", studentName: "", course: "", grade: "" });
  const [bulk, setBulk] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const bySlug = new Map((courses?.items ?? []).map((c) => [c.slug, c._id]));

  async function addSingle(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    const parsed = certificateSchema.safeParse({ ...single, issueDate: new Date().toISOString() });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Please check the fields.");
      return;
    }
    setSaving(true);
    try {
      await adminPost("/certificates", parsed.data);
      setSingle({ certificateId: "", studentName: "", course: "", grade: "" });
      setMsg("Certificate added.");
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // Bulk: one per line — certificateId, studentName, courseSlug, grade
  async function addBulk() {
    setErr(""); setMsg("");
    const lines = bulk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) {
      setErr("Paste at least one line.");
      return;
    }
    setSaving(true);
    let okCount = 0;
    try {
      for (const line of lines) {
        const [certificateId, studentName, slug, grade] = line.split(",").map((s) => s.trim());
        const course = slug ? bySlug.get(slug) : undefined;
        const parsed = certificateSchema.safeParse({
          certificateId, studentName, course, grade: grade ?? "", issueDate: new Date().toISOString(),
        });
        if (!parsed.success || !course) {
          throw new Error(`Bad line (need valid course slug): ${line}`);
        }
        await adminPost("/certificates", parsed.data);
        okCount++;
      }
      setBulk("");
      setMsg(`${okCount} certificate(s) added.`);
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bulk upload failed");
    } finally {
      setSaving(false);
    }
  }

  const remove = async (c: Certificate) => {
    if (!confirm(`Delete ${c.certificateId}?`)) return;
    await adminDel(`/certificates/${c._id}`);
    await reload();
  };

  return (
    <div>
      <PageHeader title="Certificates" subtitle="Powers the public verification lookup." />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-heading font-bold">Add individually</h2>
          <form onSubmit={addSingle} className="grid gap-3">
            <Input id="cf-id" label="Certificate ID" value={single.certificateId} onChange={(e) => setSingle((s) => ({ ...s, certificateId: e.target.value }))} required />
            <Input id="cf-name" label="Student name" value={single.studentName} onChange={(e) => setSingle((s) => ({ ...s, studentName: e.target.value }))} required />
            <label className="block"><span className="mb-1 block text-sm font-medium">Course</span>
              <select value={single.course} onChange={(e) => setSingle((s) => ({ ...s, course: e.target.value }))} className="w-full rounded-xl border border-line px-4 py-3" required>
                <option value="">Select…</option>
                {(courses?.items ?? []).map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select></label>
            <Input id="cf-grade" label="Grade (optional)" value={single.grade} onChange={(e) => setSingle((s) => ({ ...s, grade: e.target.value }))} />
            <div><Button type="submit" size="sm" disabled={saving}>Add</Button></div>
          </form>
        </Card>
        <Card>
          <h2 className="mb-3 font-heading font-bold">Bulk upload (CSV lines)</h2>
          <Textarea id="cf-bulk" label="One per line: certificateId, studentName, courseSlug, grade" value={bulk} onChange={(e) => setBulk(e.target.value)} />
          <div className="mt-2"><Button size="sm" variant="secondary" disabled={saving} onClick={addBulk}>Upload</Button></div>
        </Card>
      </div>
      {msg ? <p className="mb-2 text-sm text-success" role="status">{msg}</p> : null}
      {err ? <p className="mb-2 text-sm text-red-600" role="alert">{err}</p> : null}
      {loading ? <p className="text-muted">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { key: "certificateId", label: "ID", render: (r) => <b>{r.certificateId}</b> },
            { key: "studentName", label: "Student" },
            { key: "grade", label: "Grade", render: (r) => r.grade || "—" },
            { key: "actions", label: "", render: (r) => <Button size="sm" variant="ghost" onClick={() => remove(r)}>Delete</Button> },
          ]}
        />
      ) : null}
    </div>
  );
}
