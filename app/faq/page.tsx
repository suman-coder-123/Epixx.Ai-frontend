import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";

export const metadata = { title: "FAQ | Epixx AI" };

const FAQS = [
  ["Do I need a coding background?", "No. We start from zero and build up step by step."],
  ["Are demo classes free?", "Yes. Book a free demo and experience how we teach."],
  ["Do you help with placements?", "Yes — projects, interview prep and referrals to hiring partners."],
];

export default function Page() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <Section>
        <Container>
          <SectionHeading title="FAQ" />
          <div className="grid gap-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-line bg-white p-4">
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-2 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
          <Card className="mt-6"><p className="text-muted">Still stuck? Talk to a counselor.</p></Card>
        </Container>
      </Section>
    </>
  );
}
