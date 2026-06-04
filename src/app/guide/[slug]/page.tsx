import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuidePage, guidePages } from "@/data/guideData";
import { buildGuideMetadata } from "@/lib/seo";
import GuideDetailContent from "@/components/gallery/GuideDetailContent";

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
      <GuideDetailContent guide={guide} slug={slug} />
    </article>
  );
}