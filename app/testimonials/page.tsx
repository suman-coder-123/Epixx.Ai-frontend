import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card } from "@/components/ui/primitives";
import { TestimonialCard, type TestimonialInfo } from "@/components/ui/cards";
import { apiGet } from "@/lib/api";
import type { Course, Paginated } from "@/lib/shared";

export const metadata: Metadata = {
  title: `Student Reviews | ${SITE.shortName}`,
  description: `Real student reviews and placed-student stories at ${SITE.name}, ${SITE.city}. Filter by course.`,
};

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course } = await searchParams;
  const [testimonials, courses] = await Promise.all([
    apiGet<Paginated<TestimonialInfo>>("/testimonials?approved=true&limit=50").catch(() => null),
    apiGet<Paginated<Course>>("/courses?status=published&limit=30&sort=order").catch(() => null),
  ]);
  const all = testimonials?.items ?? [];
  const items = course ? all.filter((t) => typeof t.course === "object" && t.course?.title === course) : all;

  const ratings = all.map((t) => t.rating);
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
  const reviewJsonLd = avg
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: SITE.name,
        aggregateRating: { "@type": "AggregateRating", ratingValue: avg, reviewCount: ratings.length },
      }
    : null;

  return (
    <>
      {reviewJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd).replace(/</g, "\\u003c") }} /> : null}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Reviews"
            title="What students say"
            subtitle={avg ? `Average rating ${avg} from ${ratings.length} verified reviews.` : "Verified student reviews."}
          />
          <div className="mb-8 flex flex-wrap gap-2">
            <Link href="/testimonials" className={`rounded-full px-4 py-2 text-sm font-semibold ${!course ? "bg-primary text-white" : "bg-tint text-primary"}`}>All</Link>
            {(courses?.items ?? []).map((c) => (
              <Link
                key={c._id}
                href={`/testimonials?course=${encodeURIComponent(c.title)}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${course === c.title ? "bg-primary text-white" : "bg-tint text-primary"}`}
              >
                {c.category}
              </Link>
            ))}
          </div>
          {items.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {items.map((t) => <TestimonialCard key={t._id} t={t} />)}
            </div>
          ) : (
            <Card><p className="text-center text-muted">No reviews here yet — approved testimonials appear automatically.</p></Card>
          )}
        </Container>
      </Section>
    </>
  );
}
