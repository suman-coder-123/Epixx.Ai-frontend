"use client";

import { useState } from "react";
import { Card, Button, Input, Textarea, Badge } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPost, adminPatch, adminDel, revalidatePaths } from "@/lib/admin-client";
import { courseSchema } from "@/lib/shared";

interface SyllabusModule { module: string; topics: string; }
interface Faq { q: string; a: string; }
interface Course {
  _id: string; title: string; slug: string; category: string; shortDescription: string;
  description: string; syllabus: { module: string; topics: string[] }[]; duration: string;
  fees: number; discountedFees?: number; mode: string; level: string; thumbnail?: string;
  trainer?: { _id: string; name: string } | string; highlights: string[];
  faqs: { q: string; a: string }[]; status: string; order: number;
  metaTitle?: string; metaDescription?: string;
}

const EMPTY: Omit<Course, "_id"> = {
  title: "", slug: "", category: "Web Development", shortDescription: "", description: "",
  syllabus: [], duration: "", fees: 0, mode: "Hybrid", level: "Beginner", thumbnail: "",
  highlights: [], faqs: [], status: "draft", order: 0, metaTitle: "", metaDescription: "",
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function CourseForm({ initial, onDone }: { initial?: Course; onDone: () => void }) {
  const base: Omit<Course, "_id"> = initial
    ? { ...initial, trainer: typeof initial.trainer === "object" ? initial.trainer?._id : initial.trainer }
    : { ...EMPTY };
  const [form, setForm] = useState(base);
  const [syllabus, setSyllabus] = useState<SyllabusModule[]>(
    (initial?.syllabus ?? []).map((m) => ({ module: m.module, topics: m.topics.join("\n") })),
  );
  const [faqs, setFaqs] = useState<Faq[]>(initial?.faqs ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof base, v: unknown) => setForm((f) => ({ ...f, [k]: v } as typeof base));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      fees: Number(form.fees) || 0,
      discountedFees: form.discountedFees ? Number(form.discountedFees) : undefined,
      order: Number(form.order) || 0,
      highlights: typeof form.highlights === "string"
        ? (form.highlights as unknown as string).split("\n").map((s) => s.trim()).filter(Boolean)
        : form.highlights,
      syllabus: syllabus.filter((m) => m.module.trim()).map((m) => ({
        module: m.module.trim(),
        topics: m.topics.split("\n").map((t) => t.trim()).filter(Boolean),
      })),
      faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
    };
    const parsed = courseSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the fields.");
      return;
    }
    setSaving(true);
    try {
      if (initial) await adminPatch(`/courses/${initial._id}`, parsed.data);
      else await adminPost("/courses", parsed.data);
      await revalidatePaths(["/", "/courses", `/courses/${parsed.data.slug}`]);
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
        <Input id="c-title" label="Title" value={form.title} onChange={(e) => { set("title", e.target.value); if (!initial) set("slug", slugify(e.target.value)); }} required />
        <Input id="c-slug" label="Slug" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} required />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="block"><span className="mb-1 block text-sm font-medium">Category</span>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            {["Web Development", "Digital Marketing", "Data Science", "Cyber Security", "Design", "AI & ML"].map((c) => <option key={c}>{c}</option>)}
          </select></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Mode</span>
          <select value={form.mode} onChange={(e) => set("mode", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            {["Online", "Offline", "Hybrid"].map((m) => <option key={m}>{m}</option>)}
          </select></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Level</span>
          <select value={form.level} onChange={(e) => set("level", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
          </select></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Status</span>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            <option value="draft">Draft</option><option value="published">Published</option>
          </select></label>
      </div>
      <Textarea id="c-short" label="Short description" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} required />
      <Textarea id="c-desc" label="Full description" value={form.description} onChange={(e) => set("description", e.target.value)} required />
      <div className="grid gap-4 md:grid-cols-4">
        <Input id="c-dur" label="Duration" placeholder="6 months" value={form.duration} onChange={(e) => set("duration", e.target.value)} required />
        <Input id="c-fees" label="Fees (₹)" type="number" value={form.fees} onChange={(e) => set("fees", e.target.value)} />
        <Input id="c-dfees" label="Discounted fees (₹)" type="number" value={form.discountedFees ?? ""} onChange={(e) => set("discountedFees", e.target.value)} />
        <Input id="c-order" label="Display order" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
      </div>
      <Input id="c-thumb" label="Thumbnail URL" value={form.thumbnail ?? ""} onChange={(e) => set("thumbnail", e.target.value)} />
      <Textarea id="c-high" label="Highlights (one per line)" value={(form.highlights ?? []).join("\n")} onChange={(e) => set("highlights", e.target.value.split("\n"))} />

      <div>
        <p className="mb-2 text-sm font-medium">Syllabus modules</p>
        {syllabus.map((m, i) => (
          <Card key={i} className="mb-2">
            <Input id={`sy-m-${i}`} label="Module title" value={m.module} onChange={(e) => setSyllabus((s) => s.map((x, j) => j === i ? { ...x, module: e.target.value } : x))} />
            <div className="mt-2"><Textarea id={`sy-t-${i}`} label="Topics (one per line)" value={m.topics} onChange={(e) => setSyllabus((s) => s.map((x, j) => j === i ? { ...x, topics: e.target.value } : x))} /></div>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSyllabus((s) => s.filter((_, j) => j !== i))}>Remove module</Button>
          </Card>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => setSyllabus((s) => [...s, { module: "", topics: "" }])}>+ Add module</Button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">FAQs</p>
        {faqs.map((f, i) => (
          <Card key={i} className="mb-2">
            <Input id={`fq-q-${i}`} label="Question" value={f.q} onChange={(e) => setFaqs((s) => s.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
            <div className="mt-2"><Textarea id={`fq-a-${i}`} label="Answer" value={f.a} onChange={(e) => setFaqs((s) => s.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} /></div>
            <Button type="button" size="sm" variant="ghost" onClick={() => setFaqs((s) => s.filter((_, j) => j !== i))}>Remove</Button>
          </Card>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => setFaqs((s) => [...s, { q: "", a: "" }])}>+ Add FAQ</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input id="c-meta-t" label="SEO title" value={form.metaTitle ?? ""} onChange={(e) => set("metaTitle", e.target.value)} />
        <Input id="c-meta-d" label="SEO description" value={form.metaDescription ?? ""} onChange={(e) => set("metaDescription", e.target.value)} />
      </div>

      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      <div><Button type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Create course"}</Button></div>
    </form>
  );
}

export default function CoursesPage() {
  const { data, loading, error, reload } = useAdminFetch<{ items: Course[] }>(`/courses?limit=100&sort=order`);
  const [editing, setEditing] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);

  const duplicate = async (c: Course) => {
    if (!confirm(`Duplicate "${c.title}"?`)) return;
    const { _id, ...rest } = c;
    void _id;
    const copy = typeof rest.trainer === "object" ? { ...rest, trainer: rest.trainer?._id } : rest;
    await adminPost("/courses", { ...copy, title: `${copy.title} (copy)`, slug: `${copy.slug}-copy`, status: "draft" });
    await revalidatePaths(["/", "/courses"]);
    await reload();
  };

  const toggle = async (c: Course) => {
    await adminPatch(`/courses/${c._id}`, { status: c.status === "published" ? "draft" : "published" });
    await revalidatePaths(["/", "/courses", `/courses/${c.slug}`]);
    await reload();
  };

  const remove = async (c: Course) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    await adminDel(`/courses/${c._id}`);
    await revalidatePaths(["/", "/courses", `/courses/${c.slug}`]);
    await reload();
  };

  if (creating || editing) {
    return (
      <div>
        <PageHeader title={editing ? "Edit course" : "New course"} actions={<Button variant="outline" size="sm" onClick={() => { setCreating(false); setEditing(null); }}>Back to list</Button>} />
        <Card>
          <CourseForm initial={editing ?? undefined} onDone={() => { setCreating(false); setEditing(null); void reload(); }} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Courses" subtitle="Full CRUD with SEO fields, draft toggle, duplicate and display order." actions={<Button size="sm" onClick={() => setCreating(true)}>+ New course</Button>} />
      {loading ? <p className="text-muted">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { key: "title", label: "Course", render: (r) => <span><b>{r.title}</b><br /><span className="text-xs text-muted">/{r.slug} · order {r.order}</span></span> },
            {
              key: "status", label: "Status",
              render: (r) => <Badge tone={r.status === "published" ? "success" : "info"}>{r.status}</Badge>,
            },
            {
              key: "actions", label: "Actions",
              render: (r) => (
                <span className="flex flex-wrap gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(r)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(r)}>{r.status === "published" ? "Unpublish" : "Publish"}</Button>
                  <Button size="sm" variant="outline" onClick={() => duplicate(r)}>Duplicate</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>Delete</Button>
                </span>
              ),
            },
          ]}
        />
      ) : null}
      <p className="mt-3 text-xs text-muted">Tip: change Display order in Edit, then re-sort the list by order on the site.</p>
    </div>
  );
}
