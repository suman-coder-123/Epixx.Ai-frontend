"use client";

import { useState } from "react";
import { Card, Button, Input, Textarea, Badge } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPost, adminPatch, adminDel, revalidatePaths } from "@/lib/admin-client";
import { blogPostSchema } from "@/lib/shared";

interface Post {
  _id: string; title: string; slug: string; author: string; coverImage?: string;
  excerpt: string; body: string; category: string; tags: string[]; status: string;
  readTime: number; metaTitle?: string; metaDescription?: string;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function PostForm({ initial, onDone }: { initial?: Post; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "", slug: initial?.slug ?? "", author: initial?.author ?? "",
    coverImage: initial?.coverImage ?? "", excerpt: initial?.excerpt ?? "", body: initial?.body ?? "",
    category: initial?.category ?? "Digital Marketing", tags: (initial?.tags ?? []).join(", "),
    status: initial?.status ?? "draft", readTime: initial?.readTime ?? 5,
    metaTitle: initial?.metaTitle ?? "", metaDescription: initial?.metaDescription ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = blogPostSchema.safeParse({
      ...form,
      slug: slugify(form.slug || form.title),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      readTime: Number(form.readTime) || 5,
      publishDate: form.status === "published" ? new Date().toISOString() : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the fields.");
      return;
    }
    setSaving(true);
    try {
      if (initial) await adminPatch(`/posts/${initial._id}`, parsed.data);
      else await adminPost("/posts", parsed.data);
      await revalidatePaths(["/", "/blog", `/blog/${parsed.data.slug}`]);
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
        <Input id="p-title" label="Title" value={form.title} onChange={(e) => { set("title", e.target.value); if (!initial) set("slug", slugify(e.target.value)); }} required />
        <Input id="p-slug" label="Slug" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} required />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Input id="p-author" label="Author" value={form.author} onChange={(e) => set("author", e.target.value)} required />
        <Input id="p-cat" label="Category" value={form.category} onChange={(e) => set("category", e.target.value)} required />
        <Input id="p-read" label="Read time (min)" type="number" value={form.readTime} onChange={(e) => set("readTime", e.target.value)} />
        <label className="block"><span className="mb-1 block text-sm font-medium">Status</span>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-xl border border-line px-4 py-3">
            <option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option>
          </select></label>
      </div>
      <Input id="p-cover" label="Cover image URL" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} />
      <Textarea id="p-excerpt" label="Excerpt" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} required />
      <Textarea id="p-body" label="Body (blank line = new paragraph)" value={form.body} onChange={(e) => set("body", e.target.value)} required />
      <Input id="p-tags" label="Tags (comma separated)" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="p-meta-t" label="SEO title" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
        <Input id="p-meta-d" label="SEO description" value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      <div><Button type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Create post"}</Button></div>
    </form>
  );
}

export default function PostsPage() {
  const { data, loading, error, reload } = useAdminFetch<{ items: Post[] }>(`/posts?limit=100`);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const remove = async (p: Post) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await adminDel(`/posts/${p._id}`);
    await revalidatePaths(["/", "/blog", `/blog/${p.slug}`]);
    await reload();
  };

  if (creating || editing) {
    return (
      <div>
        <PageHeader title={editing ? "Edit post" : "New post"} actions={<Button variant="outline" size="sm" onClick={() => { setCreating(false); setEditing(null); }}>Back</Button>} />
        <Card><PostForm initial={editing ?? undefined} onDone={() => { setCreating(false); setEditing(null); void reload(); }} /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Blog" subtitle="SEO engine — draft, scheduled and published states." actions={<Button size="sm" onClick={() => setCreating(true)}>+ New post</Button>} />
      {loading ? <p className="text-muted">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { key: "title", label: "Post", render: (r) => <span><b>{r.title}</b><br /><span className="text-xs text-muted">/{r.slug} · {r.category}</span></span> },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "published" ? "success" : "info"}>{r.status}</Badge> },
            {
              key: "actions", label: "Actions",
              render: (r) => (
                <span className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(r)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>Delete</Button>
                </span>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
