import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { EnquiryForm } from "@/components/EnquiryForm";
import { apiGet } from "@/lib/api";

export const metadata: Metadata = {
  title: `Contact Us in ${SITE.city} | ${SITE.shortName}`,
  description: `Visit, call or WhatsApp ${SITE.name} in ${SITE.city}. Get free counseling and book a demo class.`,
};

interface ContactSettings {
  contact?: { phone?: string; whatsapp?: string; email?: string };
  branches?: { name: string; address: string; mapUrl?: string }[];
}

export default async function ContactPage() {
  const s = await apiGet<ContactSettings>("/settings").catch(() => null);
  const phone = s?.contact?.phone || SITE.phone;
  const email = s?.contact?.email || SITE.email;
  const whatsapp = s?.contact?.whatsapp || SITE.whatsapp;
  const branches = s?.branches?.length ? s.branches : [{ name: "Main Center", address: SITE.address, mapUrl: "" }];

  const localJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    telephone: phone,
    email,
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
              <p className="mt-2 text-ink">
                <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-accent">{phone}</a>
              </p>
              <p className="text-ink">
                <a href={`mailto:${email}`} className="hover:text-accent">{email}</a>
              </p>
              {branches.map((b) => (
                <p key={b.name} className="mt-2 text-sm text-muted">
                  <span className="font-semibold text-ink">{b.name}:</span> {b.address}{" "}
                  {b.mapUrl ? (
                    <a href={b.mapUrl} target="_blank" rel="noreferrer" className="font-semibold text-accent">
                      View map →
                    </a>
                  ) : null}
                </p>
              ))}
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi! I want details about courses.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-success px-5 py-2.5 text-sm font-heading font-semibold text-white"
                >
                  Chat on WhatsApp →
                </a>
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
