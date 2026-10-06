import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { EnquiryForm } from "@/components/EnquiryForm";
import { apiGet } from "@/lib/api";

export const metadata: Metadata = {
  title: `About Us | ${SITE.shortName}`,
  description: `The story, mission and mentors behind ${SITE.name}, ${SITE.city}'s practical skill training institute.`,
};

export default async function AboutPage() {
  const settings = await apiGet<{ stats?: { label: string; value: number; suffix?: string }[] }>("/settings").catch(() => null);

  return (
    <>
      <Section>
        <Container>
          <SectionHeading eyebrow="About us" title={`The ${SITE.shortName} story`} subtitle="A practical institute built by teachers, not marketers." />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="font-heading text-xl font-bold">Our mission</h2>
              <p className="mt-2 text-muted">
                Most students don&apos;t need more theory — they need guided practice, honest feedback and
                someone to open the first door. We run small mentor-led batches in {SITE.city} where every
                student builds real projects and gets real interview preparation.
              </p>
            </Card>
            <Card>
              <h2 className="font-heading text-xl font-bold">Why students choose us</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                <li>100% practical classes, no recorded-only teaching</li>
                <li>Small batches with personal mentor attention</li>
                <li>Portfolio projects reviewed line by line</li>
                <li>Placement support till you join</li>
                <li>Free demo class before you pay anything</li>
              </ul>
            </Card>
          </div>
          <div className="mt-6 grid gap-4 text-center sm:grid-cols-3">
            {(settings?.stats ?? []).map((s) => (
              <Card key={s.label}>
                <p className="font-heading text-3xl font-bold text-primary">{s.value}{s.suffix ?? ""}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
      <Section tint>
        <Container>
          <SectionHeading title="Milestones" />
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["2019", "First classroom batch in Jaipur"],
              ["2021", "Online batches go live"],
              ["2023", "10,000th student trained"],
              ["2025", "150+ hiring partners"],
            ].map(([y, e]) => (
              <Card key={y}>
                <p className="font-heading text-2xl font-bold text-primary">{y}</p>
                <p className="mt-1 text-sm text-muted">{e}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="font-heading text-xl font-bold">Founder&apos;s note</h2>
              <p className="mt-2 text-sm text-muted">
                “We started {SITE.shortName} because we kept meeting bright students who knew theory but
                couldn&apos;t clear practical interviews. So we built the institute we wished existed —
                projects first, honesty always.” — Founder, {SITE.name}
              </p>
              <Link href="/trainers" className="mt-3 inline-block text-sm font-semibold text-accent">Meet the mentors →</Link>
            </Card>
            <Card>
              <h2 className="font-heading text-xl font-bold">Visit us</h2>
              <div className="mt-3"><EnquiryForm sourcePage="/about" compact type="enquiry" /></div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
