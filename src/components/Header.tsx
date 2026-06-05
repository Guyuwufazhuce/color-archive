import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-gray-900 tracking-tight hover:text-gray-600 transition-colors">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/gallery"
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            Gallery
          </Link>
        </nav>
      </div>
    </header>
  );
}