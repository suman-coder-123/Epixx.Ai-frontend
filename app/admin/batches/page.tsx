"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPost, adminPatch, adminDel } from "@/lib/admin-client";

interface Batch {
  _id: string;
  course: { _id: string; title: string } | string;
  startDate: string; endDate?: string; mode: string; timing: string;
  trainer?: { _id: string; name: string } | string;
  totalSeats: number; seatsFilled: number; status: string;
}

const toInput = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

function BatchForm({ courses, trainers, onDone }: {
  courses: { _id: string; title: string }[];
  trainers: { _id: string; name: string }[];
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    course: courses[0]?._id ?? "", start: "", end: "", mode: "Online",
    timing: "", trainer: "", totalSeats: 30, seatsFilled: 0, status: "upcoming",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.course || !form.start || form.timing.trim().length < 2) {
      setError("Course, start date and timing are required.");
      return;
    }
    setSaving(true);
    try {
      await adminPost("/batches", {
        course: form.course,
        startDate: new Date(form.start).toISOString(),
        endDate: form.end ? new Date(form.end).toISOString() : undefined,
        mode: form.mode,
        timing: form.timing.trim(),
        trainer: form.trainer || undefined,
        totalSeats: Number(form.totalSeats) || 30,
        seatsFilled: Number(form.seatsFilled) || 0,
        status: form.status,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="mb-1 block text-sm font-medium">Course</span>
          <select value={form.course} onChange={(e) => set("course", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Trainer (optional)</span>
          <select value={form.trainer} onChange={(e) => set("trainer", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            <option value="">—</option>
            {trainers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Input id="b-start" label="Start date" type="datetime-local" value={form.start} onChange={(e) => set("start", e.target.value)} required />
        <Input id="b-end" label="End date (optional)" type="datetime-local" value={form.end} onChange={(e) => set("end", e.target.value)} />
        <Input id="b-timing" label="Timing" placeholder="Evening 6–8 PM" value={form.timing} onChange={(e) => set("timing", e.target.value)} required />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="block"><span className="mb-1 block text-sm font-medium">Mode</span>
          <select value={form.mode} onChange={(e) => set("mode", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            {["Online", "Offline", "Hybrid"].map((m) => <option key={m}>{m}</option>)}
          </select></label>
        <Input id="b-total" label="Total seats" type="number" value={form.totalSeats} onChange={(e) => set("totalSeats", e.target.value)} />
        <Input id="b-filled" label="Seats filled" type="number" value={form.seatsFilled} onChange={(e) => set("seatsFilled", e.target.value)} />
        <label className="block"><span className="mb-1 block text-sm font-medium">Status</span>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            {["upcoming", "filling-fast", "full", "completed"].map((s) => <option key={s}>{s}</option>)}
          </select></label>
      </div>
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      <div><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create batch"}</Button></div>
    </form>
  );
}

export default function BatchesPage() {
  const { data, loading, error, reload } = useAdminFetch<{ items: Batch[] }>(`/batches?limit=100&sort=startDate`);
  const { data: courses } = useAdminFetch<{ items: { _id: string; title: string }[] }>(`/courses?limit=100&sort=order`);
  const { data: trainers } = useAdminFetch<{ items: { _id: string; name: string }[] }>(`/trainers?limit=100`);
  const [creating, setCreating] = useState(false);

  const name = (v: Batch["course"]) => (typeof v === "object" ? v.title : v);
  const trainerName = (v: Batch["trainer"]) => (!v ? "—" : typeof v === "object" ? v.name : v);
  const left = (b: Batch) => Math.max(0, b.totalSeats - b.seatsFilled);

  const fill = async (b: Batch, seatsFilled: number) => {
    const status = seatsFilled >= b.totalSeats ? "full" : seatsFilled / b.totalSeats >= 0.8 ? "filling-fast" : "upcoming";
    await adminPatch(`/batches/${b._id}`, { seatsFilled, status });
    await reload();
  };

  const remove = async (b: Batch) => {
    if (!confirm("Delete this batch?")) return;
    await adminDel(`/batches/${b._id}`);
    await reload();
  };

  if (creating) {
    return (
      <div>
        <PageHeader title="New batch" actions={<Button variant="outline" size="sm" onClick={() => setCreating(false)}>Back</Button>} />
        <Card>
          <BatchForm
            courses={courses?.items ?? []}
            trainers={trainers?.items ?? []}
            onDone={() => { setCreating(false); void reload(); }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Batches" subtitle="Seats-remaining drives urgency badges on the public course page." actions={<Button size="sm" onClick={() => setCreating(true)}>+ New batch</Button>} />
      {loading ? <p className="text-muted">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { key: "course", label: "Course", render: (r) => <b>{name(r.course)}</b> },
            {
              key: "startDate", label: "Schedule",
              render: (r) => <span>{new Date(r.startDate).toLocaleDateString("en-IN")}<br /><span className="text-xs text-muted">{r.timing} · {r.mode} · {trainerName(r.trainer)}</span></span>,
            },
            {
              key: "seats", label: "Seats",
              render: (r) => (
                <span className="flex items-center gap-2">
                  <input
                    aria-label="Seats filled"
                    type="number" min={0} max={r.totalSeats} defaultValue={r.seatsFilled}
                    onBlur={(e) => { const v = Number(e.target.value); if (v !== r.seatsFilled) void fill(r, v); }}
                    className="w-16 rounded-lg border border-line px-2 py-1 text-sm"
                  />
                  <span className="text-sm">/ {r.totalSeats} · <b className={left(r) <= 5 ? "text-warning" : "text-success"}>{left(r)} left</b></span>
                </span>
              ),
            },
            { key: "status", label: "Status" },
            { key: "actions", label: "", render: (r) => <Button size="sm" variant="ghost" onClick={() => remove(r)}>Delete</Button> },
          ]}
        />
      ) : null}
    </div>
  );
}
