"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components/ui/primitives";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { useAdminFetch, useMe } from "@/lib/useAdmin";
import { adminPost, adminPatch, adminDel } from "@/lib/admin-client";

interface TeamUser {
  _id: string; name: string; email: string;
  role: "SuperAdmin" | "ContentManager" | "Counselor";
  isActive: boolean; lastLogin?: string;
}

export default function UsersPage() {
  const { me } = useMe();
  const { data, loading, error, reload } = useAdminFetch<{ items: TeamUser[] }>(`/admin/users`);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Counselor" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (me && me.role !== "SuperAdmin") {
    return <p className="text-red-600">Only Super Admins can manage the team.</p>;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await adminPost("/admin/users", form);
      setForm({ name: "", email: "", password: "", role: "Counselor" });
      setMsg("Team member added.");
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  const flip = async (u: TeamUser) => {
    await adminPatch(`/admin/users/${u._id}`, { isActive: !u.isActive });
    await reload();
  };
  const remove = async (u: TeamUser) => {
    if (!confirm(`Remove ${u.email}?`)) return;
    await adminDel(`/admin/users/${u._id}`);
    await reload();
  };

  return (
    <div>
      <PageHeader title="Team" subtitle="Super Admin manages admin users and roles." />
      <Card className="mb-4">
        <h2 className="mb-3 font-heading font-bold">Add member</h2>
        <form onSubmit={create} className="grid gap-3 md:grid-cols-4">
          <Input id="u-name" label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input id="u-email" label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <Input id="u-pass" label="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          <label className="block"><span className="mb-1 block text-sm font-medium">Role</span>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full rounded-xl border border-line px-4 py-3">
              <option>Counselor</option><option>ContentManager</option><option>SuperAdmin</option>
            </select></label>
        </form>
        <div className="mt-3"><Button size="sm" onClick={create}>Add member</Button></div>
        {msg ? <p className="mt-2 text-sm text-success">{msg}</p> : null}
        {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
      </Card>
      {loading ? <p className="text-muted">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error ? (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { key: "name", label: "Member", render: (r) => <span><b>{r.name}</b><br /><span className="text-xs text-muted">{r.email}</span></span> },
            { key: "role", label: "Role" },
            { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
            {
              key: "actions", label: "Actions",
              render: (r) => (
                <span className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => flip(r)}>{r.isActive ? "Deactivate" : "Activate"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>Remove</Button>
                </span>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
