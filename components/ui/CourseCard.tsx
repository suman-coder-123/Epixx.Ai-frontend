import Link from "next/link";
import type { Course } from "@/lib/shared";
import { Badge, Card } from "./primitives";

export function CourseCard({ course }: { course: Pick<Course, "_id" | "title" | "slug" | "category" | "shortDescription" | "duration" | "mode" | "fees" | "discountedFees"> }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Badge>{course.category}</Badge>
        <Badge tone="info">{course.mode}</Badge>
      </div>
      <h3 className="text-xl font-bold text-ink">
        <Link href={`/courses/${course.slug}`} className="hover:text-primary">
          {course.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted">{course.shortDescription}</p>
      <p className="mt-3 text-sm text-ink">
        {course.duration}
        {course.discountedFees ? (
          <>
            {" · "}₹{course.discountedFees.toLocaleString("en-IN")}{" "}
            <s className="text-muted">₹{course.fees.toLocaleString("en-IN")}</s>
          </>
        ) : null}
      </p>
      <Link
        href={`/courses/${course.slug}`}
        className="mt-4 inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-2 text-sm font-heading font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-primary"
      >
        View course
      </Link>
    </Card>
  );
}
