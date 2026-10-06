"use client";

import { useMemo, useState } from "react";
import { Card, Button, Input } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPatch, downloadCsv } from "@/lib/admin-client";
import { LEAD_STATUS } from "@/config/site";

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  courseLabel?: string;
  message?: string;
  sourcePage: string;
  type: string;
  status: string;
  notes?: { text: string; by?: string; at: string }[];
  createdAt: string;
}

export default function LeadsPage() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const path = useMemo(
    () => `/leads?limit=100${status ? `&status=${encodeURIComponent(status)}` : ""}`,
    [status],
  );
  const { data, loading, error, reload } = useAdminFetch<{ items: Lead[]; total: number }>(path);
  const [note, setNote] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState("");

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    if (!q.trim()) return items;
    const needle = q.toLowerCase();
    return items.filter((l) =>
      [l.name, l.phone, l.email, l.courseLabel, l.message].filter(Boolean).join(" ").toLowerCase().includes(needle),
    );
  }, [data, q]);

  const setStatusFor = async (id: string, next: string) => {
    setSaving(id);
    try {
      await adminPatch(`/leads/${id}`, { status: next });
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving("");
    }
  };

  const addNote = async (id: string) => {
    const text = (note[id] ?? "").trim();
    if (!text) return;
    setSaving(id);
    try {
      await adminPatch(`/leads/${id}`, { note: text });
      setNote((n) => ({ ...n, [id]: "" }));
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving("");
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads inbox"
        subtitle="Every demo, enquiry and contact form lands here. Fast follow-up converts."
        actions={
          <Button variant="outline" size="sm" onClick={() => downloadCsv("leads.csv", rows as unknown as Record<string, unknown>[])}>
            Export CSV
          </Button>
        }
      />
      <Card className="mb-4 flex flex-wrap gap-3">
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {LEAD_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          aria-label="Search leads"
          placeholder="Search name, phone, course…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-52 flex-1 rounded-xl border border-line px-3 py-2 text-sm"
        />
      </Card>

      {loading ? <p className="text-muted">Loading leads…</p> : null}
      {error ? <p className="text-red-600" role="alert">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={rows}
          empty="No leads match. Share the site forms to start collecting enquiries."
          columns={[
            {
              key: "name", label: "Lead",
              render: (r) => (
                <span>
                  <b>{r.name}</b><br />
                  <span className="text-xs text-muted">{r.phone}{r.email ? ` · ${r.email}` : ""}</span><br />
                  <span className="text-xs text-muted">{r.type} · {r.sourcePage}</span>
                </span>
              ),
            },
            {
              key: "courseLabel", label: "Interested in",
              render: (r) => <span className="text-sm">{r.courseLabel || r.message || "—"}</span>,
            },
            {
              key: "status", label: "Status",
              render: (r) => (
                <select
                  aria-label={`Status for ${r.name}`}
                  value={r.status}
                  disabled={saving === r._id}
                  onChange={(e) => setStatusFor(r._id, e.target.value)}
                  className="rounded-lg border border-line bg-white px-2 py-1 text-sm"
                >
                  {LEAD_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ),
            },
            {
              key: "notes", label: "Follow-up note",
              render: (r) => (
                <span className="block min-w-48">
                  {(r.notes ?? []).slice(-2).map((n, i) => (
                    <span key={i} className="block text-xs text-muted">• {n.text} {n.by ? `(${n.by})` : ""}</span>
                  ))}
                  <span className="mt-1 flex gap-1">
                    <Input id={`note-${r._id}`} label="" placeholder="Add note…" value={note[r._id] ?? ""} onChange={(e) => setNote((m) => ({ ...m, [r._id]: e.target.value }))} />
                    <Button size="sm" variant="secondary" disabled={saving === r._id} onClick={() => addNote(r._id)}>Save</Button>
                  </span>
                </span>
              ),
            },
            {
              key: "createdAt", label: "Received",
              render: (r) => new Date(r.createdAt).toLocaleString("en-IN"),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
