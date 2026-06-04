import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getColorPage, colorPages } from "@/data/colorData";
import { buildColorMetadata } from "@/lib/seo";
import ColorDetailContent from "@/components/gallery/ColorDetailContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return colorPages.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const color = getColorPage(slug);
  if (!color) return {};
  return buildColorMetadata(color);
}

export default async function ColorPage({ params }: Props) {
  const { slug } = await params;
  const color = getColorPage(slug);
  if (!color) notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <ColorDetailContent color={color} slug={slug} />
    </article>
  );
}