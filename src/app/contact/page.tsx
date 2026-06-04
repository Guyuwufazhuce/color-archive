import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";
import ContactContent from "@/components/gallery/ContactContent";

export const metadata: Metadata = {
  title: "Contact — Color Archive",
  description:
    "Get in touch with the Color Archive team. Send us your feedback, questions, or suggestions.",
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return <ContactContent />;
}