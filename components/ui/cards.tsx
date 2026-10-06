import { Card, Badge } from "./primitives";

export interface TrainerInfo {
  _id: string; name: string; photo?: string; bio: string;
  expertise: string[]; experienceYears: number;
}

export function TrainerCard({ trainer }: { trainer: TrainerInfo }) {
  return (
    <Card>
      {trainer.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={trainer.photo} alt={trainer.name} className="mb-4 h-44 w-full rounded-xl object-cover" loading="lazy" />
      ) : (
        <div className="mb-4 flex h-44 items-center justify-center rounded-xl bg-tint" aria-hidden>
          <span className="font-heading text-4xl font-bold text-primary">{trainer.name.charAt(0)}</span>
        </div>
      )}
      <h3 className="font-heading text-xl font-bold text-ink">{trainer.name}</h3>
      <p className="text-sm text-muted">{trainer.experienceYears} years experience</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {trainer.expertise.map((e) => <Badge key={e}>{e}</Badge>)}
      </div>
      <p className="mt-3 text-sm text-muted">{trainer.bio}</p>
    </Card>
  );
}

export interface TestimonialInfo {
  _id: string; studentName: string; photo?: string;
  course?: { title: string } | string;
  rating: number; quote: string; videoUrl?: string; placedAt?: string;
}

export function TestimonialCard({ t }: { t: TestimonialInfo }) {
  const course = typeof t.course === "object" ? t.course?.title : undefined;
  return (
    <Card>
      <p className="text-sm font-semibold text-success" aria-label={`${t.rating} out of 5 stars`}>
        {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
      </p>
      <p className="mt-2 text-ink">“{t.quote}”</p>
      <p className="mt-3 text-sm font-semibold text-primary">{t.studentName}</p>
      {t.placedAt ? <p className="text-xs text-success">{t.placedAt}</p> : null}
      {course ? <p className="mt-1 text-xs text-muted">{course}</p> : null}
      {t.videoUrl ? <a href={t.videoUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-accent">Watch video →</a> : null}
    </Card>
  );
}
