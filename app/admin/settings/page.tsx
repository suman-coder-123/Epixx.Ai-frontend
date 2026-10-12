"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Textarea } from "@/components/ui/primitives";
import { PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";
import { adminPut, revalidatePaths } from "@/lib/admin-client";

interface Settings {
  heroTitle?: string; heroSubtitle?: string; heroCta?: string;
  brandName?: string; logoUrl?: string;
  stats?: { label: string; value: number; suffix?: string }[];
  partners?: string[];
  contact?: { phone?: string; whatsapp?: string; email?: string };
  branches?: { name: string; address: string; mapUrl?: string }[];
  socials?: { youtube?: string; instagram?: string; linkedin?: string; facebook?: string };
  gallery?: string[];
}

const lines = (v?: string[]) => (v ?? []).join("\n");

export default function SettingsPage() {
  const { data, loading, error, reload } = useAdminFetch<Settings>(`/settings`);
  const [form, setForm] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  if (loading || !form) return <p className="text-muted">{loading ? "Loading…" : error ?? ""}</p>;
  if (error && !form) return <p className="text-red-600">{error}</p>;

  const set = (k: keyof Settings, v: unknown) => setForm((f) => ({ ...(f as Settings), [k]: v }));
  const setContact = (k: string, v: string) => setForm((f) => ({ ...(f as Settings), contact: { ...(f as Settings).contact, [k]: v } }));
  const setSocial = (k: string, v: string) => setForm((f) => ({ ...(f as Settings), socials: { ...(f as Settings).socials, [k]: v } }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    setSaving(true);
    try {
      await adminPut("/settings", form);
      await revalidatePaths(["/", "/about", "/placements", "/contact", "/gallery"]);
      setMsg("Settings saved — the public site updates without a deploy.");
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Site settings" subtitle="Hero, stats, partners, contact, branches, socials, gallery." />
      <form onSubmit={save} className="grid gap-4">
        <Card>
          <h2 className="mb-3 font-heading font-bold">Logo & branding</h2>
          <div className="grid items-start gap-4 md:grid-cols-2">
            <div className="grid gap-3">
              <Input id="s-brand" label="Brand name (text fallback)" value={form.brandName ?? ""} onChange={(e) => set("brandName", e.target.value)} />
              <Input id="s-logo" label="Logo image URL" placeholder="/logo.svg or https://…" value={form.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value)} />
              <div>
                <Button type="button" size="sm" variant="outline" onClick={() => setForm((f) => ({ ...(f as Settings), logoUrl: "/logo.svg", brandName: "Epixx AI" }))}>
                  Reset to default logo
                </Button>
              </div>
              <p className="text-xs text-muted">
                To use your own image: upload it anywhere (e.g. Cloudinary, or drop the file into frontend/public/) and paste the URL here. Empty the field to show text instead.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6 text-center">
              <p className="mb-3 text-xs text-muted">Live preview (as in header)</p>
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt={form.brandName ?? "Logo preview"} className="mx-auto h-9 w-auto" />
              ) : (
                <p className="font-heading text-lg font-bold text-primary">{form.brandName || "Brand name"}</p>
              )}
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-heading font-bold">Hero</h2>
          <div className="grid gap-3">
            <Input id="s-hero-t" label="Hero title" value={form.heroTitle ?? ""} onChange={(e) => set("heroTitle", e.target.value)} />
            <Input id="s-hero-s" label="Hero subtitle" value={form.heroSubtitle ?? ""} onChange={(e) => set("heroSubtitle", e.target.value)} />
            <Input id="s-hero-c" label="Hero CTA" value={form.heroCta ?? ""} onChange={(e) => set("heroCta", e.target.value)} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-heading font-bold">Stats (one per line: label | value | suffix)</h2>
          <Textarea
            id="s-stats" label="Stats"
            value={(form.stats ?? []).map((s) => `${s.label} | ${s.value} | ${s.suffix ?? ""}`).join("\n")}
            onChange={(e) => set("stats", e.target.value.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
              const [label, value, suffix] = l.split("|").map((s) => s.trim());
              return { label, value: Number(value) || 0, suffix: suffix ?? "" };
            }))}
          />
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-heading font-bold">Hiring partners (one per line)</h2>
            <Textarea id="s-partners" label="Partners" value={lines(form.partners)} onChange={(e) => set("partners", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
            <h2 className="mb-3 mt-4 font-heading font-bold">Gallery image URLs (one per line)</h2>
            <Textarea id="s-gallery" label="Gallery" value={lines(form.gallery)} onChange={(e) => set("gallery", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
          </Card>
          <Card>
            <h2 className="mb-3 font-heading font-bold">Contact</h2>
            <div className="grid gap-3">
              <Input id="s-phone" label="Phone" value={form.contact?.phone ?? ""} onChange={(e) => setContact("phone", e.target.value)} />
              <Input id="s-wa" label="WhatsApp number" value={form.contact?.whatsapp ?? ""} onChange={(e) => setContact("whatsapp", e.target.value)} />
              <Input id="s-email" label="Email" value={form.contact?.email ?? ""} onChange={(e) => setContact("email", e.target.value)} />
            </div>
            <h2 className="mb-3 mt-4 font-heading font-bold">Socials</h2>
            <div className="grid gap-3">
              {(["youtube", "instagram", "linkedin", "facebook"] as const).map((k) => (
                <Input key={k} id={`s-soc-${k}`} label={k} value={form.socials?.[k] ?? ""} onChange={(e) => setSocial(k, e.target.value)} />
              ))}
            </div>
          </Card>
        </div>
        <Card>
          <h2 className="mb-3 font-heading font-bold">Branches (one per line: name | address | mapUrl)</h2>
          <Textarea
            id="s-branches" label="Branches"
            value={(form.branches ?? []).map((b) => `${b.name} | ${b.address} | ${b.mapUrl ?? ""}`).join("\n")}
            onChange={(e) => set("branches", e.target.value.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
              const [name, address, mapUrl] = l.split("|").map((s) => s.trim());
              return { name, address, mapUrl: mapUrl ?? "" };
            }))}
          />
        </Card>
        {msg ? <p className="text-sm text-success" role="status">{msg}</p> : null}
        {err ? <p className="text-sm text-red-600" role="alert">{err}</p> : null}
        <div><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button></div>
      </form>
    </div>
  );
}
