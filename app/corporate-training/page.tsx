import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = { title: `Corporate Training | ${SITE.shortName}`, description: "Upskilling programs for teams: web, data, marketing and security." };

export default function CorporatePage() {
  return (
    <Section>
      <Container className="grid gap-6 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow="B2B" title="Corporate training" subtitle="Custom batches for teams, on-site or online, with assessments and reports." />
          <Card><p className="text-muted">Share your team size and goals — we will design a practical plan with projects and doubt support.</p></Card>
        </div>
        <Card><EnquiryForm sourcePage="/corporate-training" type="corporate" /></Card>
      </Container>
    </Section>
  );
}
