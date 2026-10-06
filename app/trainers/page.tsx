import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { TrainerCard, type TrainerInfo } from "@/components/ui/cards";
import { apiGet } from "@/lib/api";
import type { Paginated } from "@/lib/shared";

export const metadata: Metadata = {
  title: `Our Trainers in ${SITE.city} | ${SITE.shortName}`,
  description: `Learn from industry mentors at ${SITE.name} — MERN, SEO, data science, cyber security experts with real project experience.`,
};

export default async function TrainersPage() {
  const trainers = await apiGet<Paginated<TrainerInfo>>("/trainers?limit=30").catch(() => null);
  const items = trainers?.items ?? [];

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow="Mentors" title="Learn from people who do the work" subtitle="Industry practitioners, small batches, honest reviews." />
        {items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => <TrainerCard key={t._id} trainer={t} />)}
          </div>
        ) : (
          <Card><p className="text-center text-muted">Trainer profiles appear here once added in the admin panel.</p></Card>
        )}
      </Container>
    </Section>
  );
}
