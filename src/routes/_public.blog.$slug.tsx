import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { CTASection } from "@/components/page-parts";
import { POSTS } from "@/data/site";

export const Route = createFileRoute("/_public/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} — Stone India Heritage` },
          { name: "description", content: loaderData.post.excerpt },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.excerpt },
          { property: "og:image", content: loaderData.post.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="container-lux py-40 text-center">
      <h1 className="font-serif text-3xl">Article not found</h1>
      <Button asChild variant="gold" className="mt-6">
        <Link to="/blog">Back to journal</Link>
      </Button>
    </div>
  ),
  component: BlogDetail,
});

function BlogDetail() {
  const { post } = Route.useLoaderData();
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="pt-28">
        <div className="container-lux max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Journal
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.15em] text-gold">{post.category} · {post.date}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>
        </div>
        <div className="container-lux mt-10 max-w-5xl">
          <div className="overflow-hidden rounded-lg border border-border">
            <img src={post.image} alt={post.title} className="w-full object-cover" />
          </div>
        </div>
        <div className="container-lux mt-12 max-w-3xl space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Rajasthan sandstone has shaped some of the most enduring architecture in the world.
            Its natural warmth, workability and remarkable durability make it a material of choice
            for architects and builders across every continent.
          </p>
          <h2 className="font-serif text-2xl text-foreground">Understanding the material</h2>
          <p>
            Selecting the right stone begins with understanding finish, thickness and calibration.
            Each decision affects not only aesthetics but long-term performance in the built environment,
            from weather resistance to maintenance requirements over decades of service.
          </p>
          <blockquote className="border-l-2 border-gold pl-6 font-serif text-2xl italic text-foreground">
            "Great stone architecture is measured not in years, but in generations."
          </blockquote>
          <h2 className="font-serif text-2xl text-foreground">Specifying with confidence</h2>
          <p>
            Our technical team works alongside architects and importers to ensure every specification
            is met to export-grade tolerances — supported by full documentation, samples and
            international packaging standards.
          </p>
        </div>
      </article>

      <section className="mt-20 bg-secondary/50 py-20">
        <div className="container-lux">
          <h2 className="font-serif text-3xl text-foreground">More from the Journal</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="hover-lift group block overflow-hidden rounded-lg border border-border bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.15em] text-gold">{p.category}</p>
                  <h3 className="mt-1 font-serif text-lg text-foreground">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
