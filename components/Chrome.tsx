import Link from "next/link";
import { NAV_LINKS, SITE } from "@/config/site";
import { apiGet } from "@/lib/api";

async function BrandLogo() {
  const s = await apiGet<{ logoUrl?: string; brandName?: string }>("/settings").catch(() => null);
  const name = s?.brandName || SITE.shortName;
  // Plain <img> (not next/image) so admins can paste any image URL without config changes.
  if (s?.logoUrl) {
    return (
      <Link href="/" className="flex items-center" aria-label={`${name} — home`}>
        <img src={s.logoUrl} alt={name} width={180} height={36} className="h-9 w-auto" />
      </Link>
    );
  }
  return (
    <Link href="/" className="font-heading text-lg font-bold text-primary">
      {name}
      <span className="ml-2 hidden text-xs font-medium text-muted sm:inline">{SITE.city}</span>
    </Link>
  );
}

export async function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
        <BrandLogo />
        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-ink hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-heading font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            Book free demo
          </Link>
        </div>
      </div>
      <nav aria-label="Mobile" className="flex gap-4 overflow-x-auto border-t border-line px-5 py-2 lg:hidden">
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap text-sm text-ink">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

interface FooterSettings {
  brandName?: string;
  contact?: { phone?: string; whatsapp?: string; email?: string };
  branches?: { name: string; address: string }[];
  socials?: { youtube?: string; instagram?: string; linkedin?: string; facebook?: string };
}

export async function Footer() {
  // Footer reads live settings (contact, branches, socials) with static fallbacks,
  // so Admin → Settings edits actually reach the public site.
  const s = await apiGet<FooterSettings>("/settings").catch(() => null);
  const brand = s?.brandName || SITE.shortName;
  const phone = s?.contact?.phone || SITE.phone;
  const email = s?.contact?.email || SITE.email;
  const branches = s?.branches?.length ? s.branches : [{ name: "Main Center", address: SITE.address }];
  const socials = Object.entries(s?.socials ?? {}).filter(([, v]) => v && v.trim()) as [string, string][];

  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-heading text-lg font-bold">{brand}</p>
          <p className="mt-2 text-sm text-white/80">{SITE.tagline}</p>
          {branches.map((b) => (
            <p key={b.name} className="mt-3 text-sm text-white/80">
              <span className="font-semibold text-white">{b.name}:</span> {b.address}
            </p>
          ))}
          {socials.length ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {socials.map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="capitalize text-white/80 hover:text-white">
                  {k}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <nav aria-label="Courses">
          <p className="font-heading font-semibold">Courses</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/courses/full-stack-web-development-course">Web Development</Link></li>
            <li><Link href="/courses/digital-marketing-course">Digital Marketing</Link></li>
            <li><Link href="/courses/data-science-course">Data Science</Link></li>
            <li><Link href="/courses/cyber-security-course">Cyber Security</Link></li>
          </ul>
        </nav>
        <nav aria-label="Institute">
          <p className="font-heading font-semibold">Institute</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/placements">Placements</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </nav>
        <div>
          <p className="font-heading font-semibold">Talk to a counselor</p>
          <p className="mt-3 text-sm text-white/80">{phone}</p>
          <p className="text-sm text-white/80">{email}</p>
          <Link href="/contact" className="mt-4 inline-block rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-primary">
            Enquire now
          </Link>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}

export async function WhatsAppFloat() {
  const s = await apiGet<{ contact?: { whatsapp?: string } }>("/settings").catch(() => null);
  const wa = s?.contact?.whatsapp || SITE.whatsapp;
  return (
    <a
      href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi! I want details about courses.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-success p-3.5 text-lg font-bold text-white"
    >
      ✆
    </a>
  );
}
