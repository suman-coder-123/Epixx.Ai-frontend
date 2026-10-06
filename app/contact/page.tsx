import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: `Contact Us in ${SITE.city} | ${SITE.shortName}`,
  description: `Visit, call or WhatsApp ${SITE.name} in ${SITE.city}. Get free counseling and book a demo class.`,
};

export default function ContactPage() {
  const localJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    telephone: SITE.phone,
    email: SITE.email,
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "IN" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localJsonLd).replace(/</g, "\\u003c") }} />
      <Section>
        <Container>
          <SectionHeading eyebrow="Contact" title="Talk to a counselor" subtitle="We usually reply within a few hours." />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <EnquiryForm sourcePage="/contact" type="contact" />
            </Card>
            <Card>
              <h2 className="font-heading text-xl font-bold">Reach us</h2>
              <p className="mt-2 text-ink">{SITE.phone}</p>
              <p className="text-ink">{SITE.email}</p>
              <p className="mt-2 text-sm text-muted">{SITE.address}</p>
              <a className="mt-4 inline-block text-accent font-semibold" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">
                Chat on WhatsApp →
              </a>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
