"use client";

import { useState } from "react";
import { leadSchema, type LeadInput } from "@/lib/shared";
import { apiPost } from "@/lib/api";
import { Button, Input, Textarea } from "@/components/ui/primitives";

// One enquiry form reused everywhere via props — popup, course page, contact, corporate.
export function EnquiryForm({
  sourcePage = "/",
  preselectedCourse = "",
  compact = false,
  type = "enquiry",
}: {
  sourcePage?: string;
  preselectedCourse?: string;
  compact?: boolean;
  type?: LeadInput["type"];
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: preselectedCourse });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const parsed = leadSchema.safeParse({ ...form, sourcePage, type, courseInterested: "", courseLabel: preselectedCourse });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      setStatus("error");
      return;
    }
    try {
      await apiPost("/leads", parsed.data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-line bg-tint p-6 text-center" role="status">
        <p className="font-heading text-lg font-bold text-primary">Thanks! We got your enquiry.</p>
        <p className="mt-1 text-sm text-muted">Our counselor will call you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <Input id="eq-name" label="Full name" placeholder="Your name" value={form.name} onChange={set("name")} required autoComplete="name" />
      <Input id="eq-phone" label="Phone" placeholder="+91…" value={form.phone} onChange={set("phone")} required inputMode="tel" autoComplete="tel" />
      {!compact ? (
        <>
          <Input id="eq-email" label="Email (optional)" placeholder="you@email.com" value={form.email} onChange={set("email")} inputMode="email" autoComplete="email" />
          <Textarea id="eq-msg" label="Message" placeholder="Which course are you interested in?" value={form.message} onChange={set("message")} />
        </>
      ) : null}
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Book a free demo class"}
      </Button>
    </form>
  );
}
