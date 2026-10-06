import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import { Container, Section, Card, Badge } from "@/components/ui/primitives";
import { EnquiryForm } from "@/components/EnquiryForm";
import { apiGet } from "@/lib/api";
import type { Course, Paginated } from "@/lib/shared";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

interface Post {
  _id: string; title: string; slug: string; author: string;
  excerpt: string; body: string; category: string; tags: string[];
  readTime: number; metaTitle?: string; metaDescription?: string;
}

export async function generateStaticParams() {
  try {
    const data = await apiGet<Paginated<{ slug: string }>>("/posts?status=published&limit=50");
    return data.items.map((p) => ({ slug: p.slug }));
  } catch {
    return [{ slug: "seo-tips-for-beginners" }];
  }
}

export async function generateMetadata({ params }: Props, _parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await apiGet<Post>(`/posts/slug/${slug}`);
    return {
      title: p.metaTitle || `${p.title} | ${SITE.shortName}`,
      description: p.metaDescription || p.excerpt,
      openGraph: { title: p.title, description: p.excerpt, type: "article" },
    };
  } catch {
    return { title: `Blog | ${SITE.shortName}`, description: SITE.tagline };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post: Post | null = null;
  try {
    post = await apiGet<Post>(`/posts/slug/${slug}`);
  } catch {
    notFound();
  }
  if (!post) notFound();

  // Internal linking: related posts + a relevant course in the same category.
  const [related, courses] = await Promise.all([
    apiGet<Paginated<Post>>(`/posts?status=published&category=${encodeURIComponent(post.category)}&limit=4`).catch(() => null),
    apiGet<Paginated<Course>>("/courses?status=published&limit=30").catch(() => null),
  ]);
  const relatedPosts = (related?.items ?? []).filter((p) => p.slug !== post.slug).slice(0, 3);
  const relevantCourse = (courses?.items ?? []).find((c) =>
    c.category.toLowerCase().includes(post.category.split(" ")[0].toLowerCase()),
  );

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }} />
      <Section>
        <Container>
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
            <Link href="/" className="hover:text-accent">Home</Link> /{" "}
            <Link href="/blog" className="hover:text-accent">Blog</Link> / {post.title}
          </nav>
          <div className="grid gap-8 md:grid-cols-3">
            <article className="md:col-span-2">
              <Badge>{post.category}</Badge>
              <h1 className="mt-3 text-4xl font-bold">{post.title}</h1>
              <p className="mt-2 text-sm text-muted">By {post.author} · {post.readTime} min read</p>
              <div className="mt-6 grid gap-4">
                {post.body.split("\n").map((para, i) => (
                  <p key={i} className="text-ink">{para}</p>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => <Badge key={t}>#{t}</Badge>)}
              </div>
              {relevantCourse ? (
                <Card className="mt-8 border-primary/20 bg-tint">
                  <p className="font-heading font-bold">Want to learn this properly?</p>
                  <Link href={`/courses/${relevantCourse.slug}`} className="mt-1 inline-block font-semibold text-accent">
                    {relevantCourse.title} →
                  </Link>
                </Card>
              ) : null}
              {relatedPosts.length ? (
                <div className="mt-8">
                  <h2 className="font-heading text-xl font-bold">Keep reading</h2>
                  <ul className="mt-3 space-y-2">
                    {relatedPosts.map((p) => (
                      <li key={p.slug}><Link href={`/blog/${p.slug}`} className="text-accent">{p.title} →</Link></li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
            <aside>
              <Card className="sticky top-24">
                <h2 className="font-heading text-xl font-bold">Learn with a mentor</h2>
                <div className="mt-3"><EnquiryForm sourcePage={`/blog/${post.slug}`} compact type="enquiry" /></div>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
