import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// One Button with variants — never PrimaryButton.tsx + BlueButton.tsx copies.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-heading font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-6 py-3 text-base",
        size === "lg" && "px-8 py-4 text-lg",
        variant === "primary" && "bg-primary text-white hover:bg-primary-dark",
        variant === "secondary" && "bg-tint text-primary hover:bg-primary hover:text-white",
        variant === "outline" && "border border-line bg-white text-primary hover:border-primary",
        variant === "ghost" && "text-primary hover:bg-tint",
        className,
      )}
      {...props}
    />
  );
}

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 md:px-8", className)} {...props} />;
}

export function Section({ className, tint, ...props }: React.HTMLAttributes<HTMLElement> & { tint?: boolean }) {
  return (
    <section
      className={cn("py-14 md:py-20", tint ? "bg-tint" : "bg-white", className)}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white p-6 transition-transform duration-200 hover:scale-[1.02]",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ className, tone = "info", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "info" | "success" | "warning" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "info" && "bg-tint text-primary",
        tone === "success" && "bg-green-50 text-success",
        tone === "warning" && "bg-amber-50 text-warning",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p> : null}
      <h2 className="text-3xl font-bold text-ink md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-muted">{subtitle}</p> : null}
    </div>
  );
}

type FieldProps = { label: string; error?: string };

export function Input({ label, error, id, ...props }: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        id={id}
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <textarea
        id={id}
        rows={4}
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
