import type { Metadata } from "next";
import { SITE, COURSE_CATEGORIES } from "@/config/site";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { CourseCard } from "@/components/ui/CourseCard";
import { apiGet } from "@/lib/api";
import type { Course, Paginated } from "@/lib/shared";
import Link from "next/link";

export const metadata: Metadata = {
  title: `All Courses in ${SITE.city} | ${SITE.shortName}`,
  description: `Browse job-oriented courses at ${SITE.name}: Web Development, Digital Marketing, Data Science, Cyber Security. Filter by mode and level.`,
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  let courses: Paginated<Course>["items"] = [];
  try {
    const q = category ? `?status=published&category=${encodeURIComponent(category)}&limit=24&sort=order` : "?status=published&limit=24&sort=order";
    courses = (await apiGet<Paginated<Course>>(`/courses${q}`)).items;
  } catch {
    courses = [];
  }

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow="Courses" title={`All courses in ${SITE.city}`} subtitle="Practical, mentor-led, placement-focused." />
        <div className="mb-8 flex flex-wrap gap-2" role="navigation" aria-label="Filter by category">
          <Link href="/courses" className={`rounded-full px-4 py-2 text-sm font-semibold ${!category ? "bg-primary text-white" : "bg-tint text-primary"}`}>All</Link>
          {COURSE_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/courses?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${category === c ? "bg-primary text-white" : "bg-tint text-primary"}`}
            >
              {c}
            </Link>
          ))}
        </div>
        {courses.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">
            No courses found yet. Run the API seed script, or <Link href="/contact" className="text-accent">talk to a counselor →</Link>
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
