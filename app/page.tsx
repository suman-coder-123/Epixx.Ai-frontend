import type { Metadata } from "next";
import Link from "next/link";
import { SITE, COURSE_CATEGORIES } from "@/config/site";
import { Container, Section, SectionHeading, Card, Badge } from "@/components/ui/primitives";
import { CourseCard } from "@/components/ui/CourseCard";
import { TestimonialCard, type TestimonialInfo } from "@/components/ui/cards";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Hero3D } from "@/components/Hero3D";
import { apiGet } from "@/lib/api";
import type { Course, Paginated } from "@/lib/shared";
  
interface Settings {
  heroTitle?: string; heroSubtitle?: string; heroCta?: string;
  stats?: { label: string; value: number; suffix?: string }[];
  partners?: string[];
}
interface PostPreview { _id: string; title: string; slug: string; excerpt: string; category: string; readTime: number; }

export const metadata: Metadata = {
  title: `${SITE.name} | Job-Oriented Courses in ${SITE.city}`,
  description: `Practical Web Development, Digital Marketing, Data Science & Cyber Security courses in ${SITE.city} with live projects and placement support. Book a free demo.`,
};

async function getFeatured(): Promise<Course[]> {
  try {
    const data = await apiGet<Paginated<Course>>("/courses?status=published&limit=3&sort=order");
    return data.items;
  } catch {
    return [];
  }
}

const FALLBACK_COURSES: Pick<Course, "_id" | "title" | "slug" | "category" | "shortDescription" | "duration" | "mode" | "fees" | "discountedFees">[] = [
  { _id: "1", title: `Full Stack Web Development Course in ${SITE.city}`, slug: "full-stack-web-development-course", category: "Web Development", shortDescription: "MERN + Next.js with live projects and placement support.", duration: "6 months", mode: "Hybrid", fees: 65000, discountedFees: 45000 },
  { _id: "2", title: `Digital Marketing Course in ${SITE.city}`, slug: "digital-marketing-course", category: "Digital Marketing", shortDescription: "SEO, ads, social and analytics with live campaigns.", duration: "4 months", mode: "Online", fees: 40000, discountedFees: 28000 },
  { _id: "3", title: `Data Science Course in ${SITE.city}`, slug: "data-science-course", category: "Data Science", shortDescription: "Python, ML, SQL and dashboards with capstone.", duration: "7 months", mode: "Online", fees: 75000, discountedFees: 55000 },
];

export default async function Home() {
  const featured = (await getFeatured()) as typeof FALLBACK_COURSES;
  const courses = featured.length ? featured : FALLBACK_COURSES;

  // Live content from the backend — every block falls back so the build never breaks.
  const [settings, featuredReviews, latestPosts] = await Promise.all([
    apiGet<Settings>("/settings").catch(() => null),
    apiGet<Paginated<TestimonialInfo>>("/testimonials?approved=true&featured=true&limit=3").catch(() => null),
    apiGet<Paginated<PostPreview>>("/posts?status=published&limit=3").catch(() => null),
  ]);
  const stats = settings?.stats?.length
    ? settings.stats
    : [
        { label: "Students trained", value: 12000, suffix: "+" },
        { label: "Hiring partners", value: 150, suffix: "+" },
        { label: "Avg. rating", value: 4.8, suffix: "/5" },
      ];
  const reviews = featuredReviews?.items?.length
    ? featuredReviews.items
    : [{ _id: "fb", studentName: "Rohit Saini", rating: 5, quote: "Trainers explain every concept with live code. I built 4 projects and got placed within 2 months.", placedAt: "Placed as Frontend Developer" } satisfies TestimonialInfo];
  const posts = latestPosts?.items ?? [];

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE.name,
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "IN" },
    telephone: SITE.phone,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <Section>
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge>Admissions open · {SITE.city}</Badge>
            <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">
              {settings?.heroTitle ?? `Learn job-ready skills in ${SITE.city}`}
            </h1>
            <p className="mt-4 text-lg text-muted">
              {settings?.heroSubtitle ?? "Practical courses with mentors, live projects and placement support. Start with a free demo class."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-2xl bg-primary px-8 py-4 font-heading font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark">
                {settings?.heroCta ?? "Book a free demo class"}
              </Link>
              <Link href="/courses" className="rounded-2xl border border-line px-8 py-4 font-heading font-semibold text-primary hover:border-primary">
                Explore courses
              </Link>
            </div>
          </div>
          <Hero3D />
        </Container>
      </Section>

      {/* Categories */}
      <Section tint>
        <Container>
          <SectionHeading eyebrow="Categories" title="Find your path" subtitle="Small batches, mentor-led, project-first." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COURSE_CATEGORIES.map((c) => (
              <Card key={c}>
                <p className="font-heading text-lg font-bold text-primary">{c}</p>
                <Link href="/courses" className="mt-1 inline-block text-sm text-accent">View courses →</Link>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Stats — driven by Admin → Settings */}
      <Section>
        <Container>
          <div className="grid gap-4 text-center sm:grid-cols-3">
            {stats.map((s) => (
              <Card key={s.label}>
                <p className="font-heading text-3xl font-bold text-primary">{s.value}{s.suffix ?? ""}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
          {(settings?.partners?.length ?? 0) > 0 ? (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {settings?.partners?.map((p) => (
                <span key={p} className="rounded-full bg-tint px-4 py-1.5 text-xs font-semibold text-primary">{p}</span>
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      {/* Featured courses */}
      <Section tint>
        <Container>
          <SectionHeading eyebrow="Popular" title="Featured courses" />
          <div className="grid gap-5 md:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/courses" className="text-accent font-semibold">View all courses →</Link>
          </div>
        </Container>
      </Section>

      {/* Testimonials + CTA */}
      <Section>
        <Container>
          <SectionHeading eyebrow="Reviews" title="Students get placed" />
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((t) => (
              <TestimonialCard key={t._id} t={t} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/testimonials" className="text-accent font-semibold">Read all success stories →</Link>
          </div>
        </Container>
      </Section>

      {/* Blog preview */}
      {posts.length ? (
        <Section tint>
          <Container>
            <SectionHeading eyebrow="Blog" title="Learn something useful" />
            <div className="grid gap-5 md:grid-cols-3">
              {posts.map((p) => (
                <Card key={p._id}>
                  <Badge>{p.category}</Badge>
                  <h3 className="mt-2 font-heading text-lg font-bold">
                    <Link href={`/blog/${p.slug}`} className="hover:text-primary">{p.title}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted">{p.excerpt}</p>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/blog" className="text-accent font-semibold">Read the blog →</Link>
            </div>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container className="grid gap-8 md:grid-cols-2">
          <Card>
            <h2 className="font-heading text-2xl font-bold text-ink">Talk to a counselor</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Free guidance, no pressure. We reply within a few hours.</p>
            <EnquiryForm sourcePage="/" compact />
          </Card>
          <Card>
            <h2 className="font-heading text-2xl font-bold text-ink">Visit a branch</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Walk in for a free demo class and campus tour.</p>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-heading font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark">
              Contact us
            </Link>
          </Card>
        </Container>
      </Section>

      <Section tint>
        <Container className="text-center">
          <h2 className="font-heading text-3xl font-bold">Not sure where to start?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">Book a free demo class and experience how we teach before you decide.</p>
          <div className="mt-6">
            <Link href="/contact" className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 font-heading font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark">
              Book a free demo class
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
