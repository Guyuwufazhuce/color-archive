import type { Metadata } from "next";
import PhotoDetailClient from "@/components/gallery/PhotoDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Photo Detail - Color Archive",
};

export default async function PhotoPage({ params }: Props) {
  const { id } = await params;
  return <PhotoDetailClient id={id} />;
}