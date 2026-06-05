import { siteConfig } from "@/data/siteConfig";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-center">
        <p className="text-xs text-gray-400">{siteConfig.copyright}</p>
      </div>
    </footer>
  );
}