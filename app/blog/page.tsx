import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { Container, Section, SectionHeading, Card, Badge } from "@/components/ui/primitives";
import { apiGet } from "@/lib/api";
import type { Paginated } from "@/lib/shared";

export const metadata: Metadata = {
  title: `Blog | ${SITE.shortName}`,
  description: `Practical guides on web development, marketing, data and careers from ${SITE.name} mentors.`,
};

interface Post {
  _id: string; title: string; slug: string; excerpt: string;
  category: string; tags: string[]; readTime: number;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const q = category ? `?status=published&category=${encodeURIComponent(category)}&limit=30` : "?status=published&limit=30";
  const posts = await apiGet<Paginated<Post>>(`/posts${q}`).catch(() => null);
  const items = posts?.items ?? [];
  const cats = [...new Set(items.map((p) => p.category))];

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow="Blog" title="Learn something useful" subtitle="Long guides, honest advice, zero hype." />
        {cats.length ? (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog" className={`rounded-full px-4 py-2 text-sm font-semibold ${!category ? "bg-primary text-white" : "bg-tint text-primary"}`}>All</Link>
            {cats.map((c) => (
              <Link key={c} href={`/blog?category=${encodeURIComponent(c)}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === c ? "bg-primary text-white" : "bg-tint text-primary"}`}>{c}</Link>
            ))}
          </div>
        ) : null}
        {items.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((p) => (
              <Card key={p._id}>
                <Badge>{p.category}</Badge>
                <h2 className="mt-2 font-heading text-xl font-bold">
                  <Link href={`/blog/${p.slug}`} className="hover:text-primary">{p.title}</Link>
                </h2>
                <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
                <p className="mt-3 text-xs text-muted">{p.readTime} min read</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card><p className="text-center text-muted">Articles appear here once published from the admin panel.</p></Card>
        )}
      </Container>
    </Section>
  );
}
