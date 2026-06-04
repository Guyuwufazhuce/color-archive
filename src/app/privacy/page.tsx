import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";
import PrivacyContent from "@/components/gallery/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — Color Archive",
  description:
    "Color Archive's privacy policy. All image processing happens locally in your browser. We don't collect, store, or share your images or personal data.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}