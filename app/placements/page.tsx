import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { TestimonialCard, type TestimonialInfo } from "@/components/ui/cards";
import { EnquiryForm } from "@/components/EnquiryForm";
import { apiGet } from "@/lib/api";
import type { Paginated } from "@/lib/shared";

export const metadata: Metadata = {
  title: `Placements in ${SITE.city} | ${SITE.shortName}`,
  description: `Hiring partners, placement stats and placed-student stories at ${SITE.name}, ${SITE.city}. Book a free demo class.`,
};

interface Settings {
  partners?: string[];
  stats?: { label: string; value: number; suffix?: string }[];
}

export default async function PlacementsPage() {
  const [settings, testimonials] = await Promise.all([
    apiGet<Settings>("/settings").catch(() => null),
    apiGet<Paginated<TestimonialInfo>>("/testimonials?approved=true&limit=12").catch(() => null),
  ]);
  const stories = (testimonials?.items ?? []).filter((t) => t.placedAt);

  return (
    <>
      <Section>
        <Container>
          <SectionHeading eyebrow="Placements" title="Students get placed. Then they refer friends." subtitle="Projects, mock interviews and referrals — the full placement loop." />
          <div className="grid gap-4 text-center sm:grid-cols-3">
            {(settings?.stats ?? [
              { label: "Students trained", value: 12000, suffix: "+" },
              { label: "Hiring partners", value: 150, suffix: "+" },
              { label: "Avg. rating", value: 4.8, suffix: "/5" },
            ]).map((s) => (
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
          <SectionHeading eyebrow="Hiring partners" title="Where our students work" />
          <div className="flex flex-wrap justify-center gap-3">
            {(settings?.partners ?? ["TCS", "Infosys", "Wipro", "HCLTech"]).map((p) => (
              <span key={p} className="rounded-2xl border border-line bg-white px-6 py-3 font-heading font-semibold text-primary">{p}</span>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Success stories" title="Placed students" />
          {stories.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {stories.map((t) => <TestimonialCard key={t._id} t={t} />)}
            </div>
          ) : (
            <Card><p className="text-center text-muted">Stories appear here once testimonials are approved in the admin panel.</p></Card>
          )}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="font-heading text-xl font-bold">How placements work</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink">
                <li>Build portfolio projects with mentor reviews.</li>
                <li>Practice mock interviews and aptitude rounds.</li>
                <li>Get referrals to hiring partners.</li>
                <li>Keep getting support till you join.</li>
              </ol>
              <Link href="/courses" className="mt-4 inline-block text-sm font-semibold text-accent">Explore courses →</Link>
            </Card>
            <Card>
              <h2 className="font-heading text-xl font-bold">Get placement guidance</h2>
              <div className="mt-3"><EnquiryForm sourcePage="/placements" compact type="enquiry" /></div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
