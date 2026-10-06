import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";

export const metadata = { title: "Careers | Epixx AI" };

export default function Page() {
  return (
    <Section>
      <Container>
        <SectionHeading title="Careers" />
        <Card><p className="text-muted">Openings for trainers and staff. Write to hello@epixx.ai.</p></Card>
      </Container>
    </Section>
  );
}
