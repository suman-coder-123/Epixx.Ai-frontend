"use client";

import Link from "next/link";
import { Card } from "@/components/ui/primitives";
import { DataTable, StatCard, PageHeader } from "@/components/admin/ui";
import { useAdminFetch } from "@/lib/useAdmin";

interface Stats {
  leadsWeek: number;
  leadsMonth: number;
  enrolled: number;
  demoScheduled: number;
  activeBatches: number;
  publishedCourses: number;
  pendingTestimonials: number;
  leadsByStatus: { _id: string; count: number }[];
  topCourses: { _id: string; count: number }[];
  byDay: { _id: string; count: number }[];
  recentLeads: { _id: string; name: string; phone: string; status: string; courseLabel?: string; createdAt: string }[];
  recentActivity: { _id: string; action: string; collection: string; label?: string; by: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const { data, loading, error } = useAdminFetch<Stats>("/admin/stats");

  if (loading) return <p className="text-muted">Loading dashboard…</p>;
  if (error || !data) return <p className="text-red-600" role="alert">{error || "Failed to load"}</p>;

  const maxDay = Math.max(1, ...data.byDay.map((d) => d.count));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Leads, enrolments, batches and recent activity at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Leads this week" value={String(data.leadsWeek)} hint={`${data.leadsMonth} this month`} />
        <StatCard label="Enrolled" value={String(data.enrolled)} hint={`${data.demoScheduled} demos scheduled`} />
        <StatCard label="Active batches" value={String(data.activeBatches)} hint={`${data.publishedCourses} courses published`} />
        <StatCard label="Testimonials to review" value={String(data.pendingTestimonials)} hint="Approve before publishing" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-heading font-bold text-ink">Leads — last 14 days</h2>
          <div className="mt-4 flex h-28 items-end gap-1" role="img" aria-label="Leads per day chart">
            {data.byDay.map((d) => (
              <div key={d._id} className="flex-1 rounded-t bg-accent" style={{ height: `${Math.max(6, (d.count / maxDay) * 100)}%` }} title={`${d._id}: ${d.count}`} />
            ))}
            {!data.byDay.length ? <p className="text-sm text-muted">No leads yet.</p> : null}
          </div>
        </Card>
        <Card>
          <h2 className="font-heading font-bold text-ink">Top courses by enquiry</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.topCourses.map((t) => (
              <li key={t._id} className="flex justify-between border-b border-line pb-2 last:border-0">
                <span className="text-ink">{t._id}</span>
                <span className="font-semibold text-primary">{t.count}</span>
              </li>
            ))}
            {!data.topCourses.length ? <li className="text-muted">No enquiries yet.</li> : null}
          </ul>
          <h2 className="mt-5 font-heading font-bold text-ink">Leads by status</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.leadsByStatus.map((s) => (
              <span key={s._id} className="rounded-full bg-tint px-3 py-1 text-xs font-semibold text-primary">
                {s._id}: {s.count}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading font-bold text-ink">Recent leads</h2>
            <Link href="/admin/leads" className="text-sm text-accent">Open inbox →</Link>
          </div>
          <DataTable
            rows={data.recentLeads}
            empty="No leads yet."
            columns={[
              { key: "name", label: "Name", render: (r) => <span><b>{r.name}</b><br /><span className="text-xs text-muted">{r.phone}</span></span> },
              { key: "status", label: "Status" },
              { key: "createdAt", label: "When", render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN") },
            ]}
          />
        </div>
        <div>
          <h2 className="mb-2 font-heading font-bold text-ink">Recent activity</h2>
          <Card>
            <ul className="space-y-2 text-sm">
              {data.recentActivity.map((a) => (
                <li key={a._id} className="border-b border-line pb-2 last:border-0">
                  <span className="font-semibold text-primary">{a.action}</span>{" "}
                  <span className="text-muted">{a.collection}</span>{" "}
                  <span className="text-ink">{a.label ?? ""}</span>
                  <span className="block text-xs text-muted">{a.by} · {new Date(a.createdAt).toLocaleString("en-IN")}</span>
                </li>
              ))}
              {!data.recentActivity.length ? <li className="text-muted">No activity yet.</li> : null}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
