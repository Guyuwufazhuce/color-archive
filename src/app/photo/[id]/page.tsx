import type { Metadata } from "next";
import PhotoDetailClient from "@/components/gallery/PhotoDetailClient";

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: "Photo Detail - Color Archive",
};

export default function PhotoPage({ params }: Props) {
  return <PhotoDetailClient id={params.id} />;
}