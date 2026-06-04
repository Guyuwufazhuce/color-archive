import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuidePage, guidePages } from "@/data/guideData";
import { buildGuideMetadata } from "@/lib/seo";
import AdsPlaceholder from "@/components/AdsPlaceholder";
import { siteConfig } from "@/data/siteConfig";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guidePages.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuidePage(slug);
  if (!guide) return {};
  return buildGuideMetadata(guide);
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuidePage(slug);
  if (!guide) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/guide" className="hover:text-gray-600 transition-colors">
          Guides
        </Link>
        <span>/</span>
        <span className="text-gray-600">{guide.title}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        {guide.title}
      </h1>

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
          {guide.category}
        </span>
        <span>·</span>
        <span>{guide.readTime}</span>
      </div>

      <div className="mt-8 space-y-8">
        {guide.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {section.heading}
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>

            {/* Ad slot after 2nd and 5th sections */}
            {(i === 1 || i === 4) && (
              <AdsPlaceholder format="banner" className="my-8" />
            )}
          </section>
        ))}
      </div>

      {/* FAQ */}
      {guide.faq.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {guide.faq.map((item, i) => (
              <div key={i}>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {item.q}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related guides */}
      <section className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Related Guides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guidePages
            .filter((g) => g.slug !== slug)
            .slice(0, 2)
            .map((g) => (
              <Link
                key={g.slug}
                href={`/guide/${g.slug}`}
                className="block p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <h3 className="text-xs font-semibold text-gray-900">
                  {g.title}
                </h3>
                <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                  {g.description}
                </p>
              </Link>
            ))}
        </div>
      </section>

      {/* Schema.org Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            url: `${siteConfig.url}/guide/${slug}`,
            author: {
              "@type": "Organization",
              name: siteConfig.name,
            },
          }),
        }}
      />
    </article>
  );
}