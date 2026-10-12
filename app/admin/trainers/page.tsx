"use client";

import { useState } from "react";
import { Card, Button, Input, Textarea } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPost, adminPatch, adminDel, revalidatePaths } from "@/lib/admin-client";

interface Trainer {
  _id: string; name: string; slug: string; photo?: string; bio: string;
  expertise: string[]; experienceYears: number; linkedIn?: string; status: string;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function TrainerForm({ initial, onDone }: { initial?: Trainer; onDone: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "", slug: initial?.slug ?? "", photo: initial?.photo ?? "",
    bio: initial?.bio ?? "", expertise: (initial?.expertise ?? []).join(", "),
    experienceYears: initial?.experienceYears ?? 0, linkedIn: initial?.linkedIn ?? "",
    status: initial?.status ?? "active",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2 || form.bio.trim().length < 10) {
      setError("Name and a short bio (10+ chars) are required.");
      return;
    }
    const payload = {
      ...form,
      slug: slugify(form.slug || form.name),
      expertise: form.expertise.split(",").map((s) => s.trim()).filter(Boolean),
      experienceYears: Number(form.experienceYears) || 0,
    };
    setSaving(true);
    try {
      if (initial) await adminPatch(`/trainers/${initial._id}`, payload);
      else await adminPost("/trainers", payload);
      await revalidatePaths(["/trainers"]);
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
        <Input id="t-name" label="Name" value={form.name} onChange={(e) => { set("name", e.target.value); if (!initial) set("slug", slugify(e.target.value)); }} required />
        <Input id="t-slug" label="Slug" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} required />
      </div>
      <Input id="t-photo" label="Photo URL" value={form.photo} onChange={(e) => set("photo", e.target.value)} />
      <Textarea id="t-bio" label="Bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} required />
      <div className="grid gap-4 md:grid-cols-3">
        <Input id="t-exp" label="Expertise (comma separated)" value={form.expertise} onChange={(e) => set("expertise", e.target.value)} />
        <Input id="t-yrs" label="Experience (years)" type="number" value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} />
        <Input id="t-li" label="LinkedIn URL" value={form.linkedIn} onChange={(e) => set("linkedIn", e.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      <div><Button type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Add trainer"}</Button></div>
    </form>
  );
}

export default function TrainersPage() {
  const { data, loading, error, reload } = useAdminFetch<{ items: Trainer[] }>(`/trainers?limit=100`);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [creating, setCreating] = useState(false);

  const remove = async (t: Trainer) => {
    if (!confirm(`Delete "${t.name}"?`)) return;
    await adminDel(`/trainers/${t._id}`);
    await revalidatePaths(["/trainers"]);
    await reload();
  };

  if (creating || editing) {
    return (
      <div>
        <PageHeader title={editing ? "Edit trainer" : "New trainer"} actions={<Button variant="outline" size="sm" onClick={() => { setCreating(false); setEditing(null); }}>Back</Button>} />
        <Card><TrainerForm initial={editing ?? undefined} onDone={() => { setCreating(false); setEditing(null); void reload(); }} /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Trainers" subtitle="Photo, expertise tags and course assignment." actions={<Button size="sm" onClick={() => setCreating(true)}>+ New trainer</Button>} />
      {loading ? <p className="text-muted">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { key: "name", label: "Trainer", render: (r) => <span><b>{r.name}</b><br /><span className="text-xs text-muted">{r.experienceYears} yrs · {(r.expertise ?? []).join(", ")}</span></span> },
            { key: "status", label: "Status" },
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
