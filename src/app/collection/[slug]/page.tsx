import { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionClient from "@/components/gallery/CollectionClient";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/types";
import { buildCollectionMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

const VALID_COLLECTIONS = new Set(CATEGORY_ORDER);

export async function generateStaticParams() {
  return CATEGORY_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!VALID_COLLECTIONS.has(slug as any)) return {};
  const label = CATEGORY_LABELS[slug as keyof typeof CATEGORY_LABELS] || slug;
  return buildCollectionMetadata(label, slug);
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  if (!VALID_COLLECTIONS.has(slug as any)) notFound();
  return <CollectionClient colorSlug={slug} />;
}