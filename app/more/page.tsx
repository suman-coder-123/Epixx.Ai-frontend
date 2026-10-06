import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import Link from "next/link";

const PAGES: Array<[string, string, string]> = [
  ["Placements", "/placements", "Hiring partners, placement stats and student success stories."],
  ["Trainers", "/trainers", "Mentor profiles — photo, expertise and experience."],
  ["Testimonials", "/testimonials", "Student reviews filtered by course, with AggregateRating schema."],
  ["Blog", "/blog", "SEO content hub targeting long-tail keywords."],
  ["Gallery", "/gallery", "Classroom, campus and event photos."],
  ["FAQ", "/faq", "Accordion grouped by topic with FAQPage schema."],
  ["Verify Certificate", "/verify-certificate", "Lookup by certificate ID."],
  ["Careers", "/careers", "Openings for trainers and staff."],
];

export default function StubIndex() {
  return (
    <Section>
      <Container>
        <SectionHeading title="More pages" subtitle="Scaffolded routes — content managed from the admin panel." />
        <div className="grid gap-4 md:grid-cols-2">
          {PAGES.map(([t, href, d]) => (
            <Card key={href}>
              <Link href={href} className="font-heading font-bold text-primary">{t}</Link>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{SITE.name} · {SITE.city}</p>
      </Container>
    </Section>
  );
}
