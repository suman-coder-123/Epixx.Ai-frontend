"use client";

import { useState } from "react";
import { Card, Button, Input, Textarea } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPost, adminPatch, adminDel } from "@/lib/admin-client";
import { testimonialSchema } from "@/lib/shared";

interface Testimonial {
  _id: string; studentName: string; photo?: string; course?: { _id: string; title: string } | string;
  rating: number; quote: string; videoUrl?: string; placedAt?: string; featured: boolean; approved: boolean;
  createdAt: string;
}

function TestimonialForm({ courses, onDone }: {
  courses: { _id: string; title: string }[];
  onDone: () => void;
}) {
  const [form, setForm] = useState({ studentName: "", photo: "", course: "", rating: 5, quote: "", videoUrl: "", placedAt: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = testimonialSchema.safeParse({ ...form, course: form.course || undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the fields.");
      return;
    }
    setSaving(true);
    try {
      await adminPost("/testimonials", parsed.data);
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
        <Input id="ts-name" label="Student name" value={form.studentName} onChange={(e) => set("studentName", e.target.value)} required />
        <label className="block"><span className="mb-1 block text-sm font-medium">Course</span>
          <select value={form.course} onChange={(e) => set("course", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            <option value="">—</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select></label>
      </div>
      <Textarea id="ts-quote" label="Quote" value={form.quote} onChange={(e) => set("quote", e.target.value)} required />
      <div className="grid gap-4 md:grid-cols-3">
        <Input id="ts-rating" label="Rating (1–5)" type="number" value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} />
        <Input id="ts-placed" label="Placed at (e.g. Placed as…)" value={form.placedAt} onChange={(e) => set("placedAt", e.target.value)} />
        <Input id="ts-video" label="Video URL (optional)" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      <div><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Add testimonial"}</Button></div>
    </form>
  );
}

export default function TestimonialsPage() {
  const { data, loading, error, reload } = useAdminFetch<{ items: Testimonial[] }>(`/testimonials?limit=100`);
  const { data: courses } = useAdminFetch<{ items: { _id: string; title: string }[] }>(`/courses?limit=100`);
  const [creating, setCreating] = useState(false);

  const flip = async (t: Testimonial, key: "approved" | "featured") => {
    await adminPatch(`/testimonials/${t._id}`, { [key]: !t[key] });
    await reload();
  };
  const remove = async (t: Testimonial) => {
    if (!confirm(`Delete review by "${t.studentName}"?`)) return;
    await adminDel(`/testimonials/${t._id}`);
    await reload();
  };

  if (creating) {
    return (
      <div>
        <PageHeader title="New testimonial" actions={<Button variant="outline" size="sm" onClick={() => setCreating(false)}>Back</Button>} />
        <Card><TestimonialForm courses={courses?.items ?? []} onDone={() => { setCreating(false); void reload(); }} /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Testimonials" subtitle="Approve before publishing. Featured ones show on the homepage." actions={<Button size="sm" onClick={() => setCreating(true)}>+ New</Button>} />
      {loading ? <p className="text-muted">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            {
              key: "studentName", label: "Review",
              render: (r) => <span><b>{r.studentName}</b> · {"★".repeat(r.rating)}<br /><span className="text-xs text-muted">{r.quote.slice(0, 90)}…</span><br /><span className="text-xs text-muted">{r.placedAt ?? ""}</span></span>,
            },
            {
              key: "approved", label: "Approved",
              render: (r) => <Button size="sm" variant={r.approved ? "secondary" : "outline"} onClick={() => flip(r, "approved")}>{r.approved ? "Yes" : "Approve"}</Button>,
            },
            {
              key: "featured", label: "Featured",
              render: (r) => <Button size="sm" variant={r.featured ? "secondary" : "outline"} onClick={() => flip(r, "featured")}>{r.featured ? "Yes" : "Feature"}</Button>,
            },
            { key: "actions", label: "", render: (r) => <Button size="sm" variant="ghost" onClick={() => remove(r)}>Delete</Button> },
          ]}
        />
      ) : null}
    </div>
  );
}
