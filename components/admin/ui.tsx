"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/primitives";

// One generic table for every admin list screen — columns + rows as props.
export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  empty = "No records found.",
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}) {
  if (!rows.length) {
    return <Card><p className="text-center text-sm text-muted">{empty}</p></Card>;
  }
  const cell = (row: T, col: Column<T>) =>
    col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—");
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-160 text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-tint">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-heading font-semibold text-primary">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-b border-line last:border-0 hover:bg-tint/50">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 align-top text-ink">{cell(row, c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
