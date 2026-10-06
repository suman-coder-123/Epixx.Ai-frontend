import type { Metadata } from "next";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { apiGet } from "@/lib/api";

export const metadata: Metadata = { title: "Gallery | Epixx AI" };

export default async function GalleryPage() {
  const settings = await apiGet<{ gallery?: string[] }>("/settings").catch(() => null);
  const images = settings?.gallery ?? [];

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow="Campus life" title="Gallery" subtitle="Classrooms, campus and events. Managed from Admin → Settings." />
        {images.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`Epixx campus photo ${i + 1}`} loading="lazy" className="h-56 w-full rounded-2xl border border-line object-cover" />
            ))}
          </div>
        ) : (
          <Card><p className="text-center text-muted">Photos appear here once added in Admin → Settings → Gallery.</p></Card>
        )}
      </Container>
    </Section>
  );
}
