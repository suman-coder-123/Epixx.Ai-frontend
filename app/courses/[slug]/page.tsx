import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import { Container, Section, Card, Badge } from "@/components/ui/primitives";
import { EnquiryForm } from "@/components/EnquiryForm";
import { apiGet } from "@/lib/api";
import type { Course } from "@/lib/shared";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const data = await apiGet<{ items: { slug: string }[] }>("/courses?status=published&limit=50");
    return data.items.map((c) => ({ slug: c.slug }));
  } catch {
    return [
      { slug: "full-stack-web-development-course" },
      { slug: "digital-marketing-course" },
      { slug: "data-science-course" },
      { slug: "cyber-security-course" },
    ];
  }
}

export async function generateMetadata({ params }: Props, _parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  try {
    const c = await apiGet<Course>(`/courses/slug/${slug}`);
    return {
      title: c.metaTitle || `${c.title} | ${SITE.shortName}`,
      description: c.metaDescription || c.shortDescription,
      openGraph: { title: c.title, description: c.shortDescription, type: "article" },
      twitter: { card: "summary_large_image", title: c.title, description: c.shortDescription },
    };
  } catch {
    return { title: `Course | ${SITE.shortName}`, description: SITE.tagline };
  }
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  let course: Course | null = null;
  try {
    course = await apiGet<Course>(`/courses/slug/${slug}`);
  } catch {
    notFound();
  }
  if (!course) notFound();

  // Upcoming batches drive the urgency badges ("Filling Fast" lives here).
  interface BatchInfo {
    _id: string; startDate: string; mode: string; timing: string;
    totalSeats: number; seatsFilled: number; status: string;
    trainer?: { name: string } | string;
  }
  const batches = await apiGet<{ items: BatchInfo[] }>(
    `/batches?course=${course._id}&limit=10&sort=startDate`,
  ).catch(() => null);
  const upcoming = (batches?.items ?? []).filter((b) => b.status !== "completed");

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.shortDescription,
    provider: { "@type": "EducationalOrganization", name: SITE.name, sameAs: SITE.url },
  };
  const faqJsonLd = course.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: course.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;
  const crumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE.url}/courses` },
      { "@type": "ListItem", position: 3, name: course.title, item: `${SITE.url}/courses/${course.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd).replace(/</g, "\\u003c") }} />
      {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} /> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbJsonLd).replace(/</g, "\\u003c") }} />

      <Section>
        <Container>
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
            <Link href="/" className="hover:text-accent">Home</Link> /{" "}
            <Link href="/courses" className="hover:text-accent">Courses</Link> / {course.title}
          </nav>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge>{course.category}</Badge>
                <Badge>{course.mode}</Badge>
                <Badge>{course.level}</Badge>
              </div>
              <h1 className="mt-3 text-4xl font-bold">{course.title}</h1>
              <p className="mt-3 text-lg text-muted">{course.shortDescription}</p>

              {course.highlights?.length ? (
                <Card className="mt-6">
                  <h2 className="font-heading text-xl font-bold">Why this course</h2>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-ink">
                    {course.highlights.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                </Card>
              ) : null}

              {course.syllabus?.length ? (
                <div className="mt-6">
                  <h2 className="font-heading text-2xl font-bold">Syllabus</h2>
                  <div className="mt-3 grid gap-3">
                    {course.syllabus.map((m) => (
                      <details key={m.module} className="rounded-2xl border border-line bg-white p-4">
                        <summary className="cursor-pointer font-heading font-semibold text-primary">{m.module}</summary>
                        <ul className="mt-2 list-disc pl-5 text-sm text-ink">
                          {m.topics.map((t) => <li key={t}>{t}</li>)}
                        </ul>
                      </details>
                    ))}
                  </div>
                </div>
              ) : null}

              {upcoming.length ? (
                <div className="mt-6">
                  <h2 className="font-heading text-2xl font-bold">Upcoming batches</h2>
                  <div className="mt-3 grid gap-3">
                    {upcoming.map((b) => {
                      const left = Math.max(0, b.totalSeats - b.seatsFilled);
                      return (
                        <div key={b._id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white p-4">
                          <div>
                            <p className="font-heading font-semibold text-ink">
                              {new Date(b.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} · {b.timing}
                            </p>
                            <p className="text-xs text-muted">{b.mode}{typeof b.trainer === "object" && b.trainer ? ` · ${b.trainer.name}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {b.status === "filling-fast" ? <Badge tone="warning">Filling Fast · {left} left</Badge>
                              : b.status === "full" ? <Badge>Full</Badge>
                                : <Badge tone="success">{left} seats left</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {course.faqs?.length ? (
                <div className="mt-6">
                  <h2 className="font-heading text-2xl font-bold">FAQs</h2>
                  <div className="mt-3 grid gap-3">
                    {course.faqs.map((f) => (
                      <details key={f.q} className="rounded-2xl border border-line bg-white p-4">
                        <summary className="cursor-pointer font-semibold">{f.q}</summary>
                        <p className="mt-2 text-sm text-muted">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside>
              <Card className="sticky top-24">
                <p className="font-heading text-3xl font-bold text-primary">
                  ₹{(course.discountedFees ?? course.fees).toLocaleString("en-IN")}
                </p>
                {course.discountedFees ? <p className="text-sm text-muted"><s>₹{course.fees.toLocaleString("en-IN")}</s> · {course.duration}</p> : <p className="text-sm text-muted">{course.duration}</p>}
                <div className="mt-4">
                  <EnquiryForm sourcePage={`/courses/${course.slug}`} preselectedCourse={course.title} compact type="demo" />
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
