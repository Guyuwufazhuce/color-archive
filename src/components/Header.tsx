"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/" },
    { name: "Gallery", href: "/gallery" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
          style={{
            background:
              "linear-gradient(90deg, #FF3B30, #FF9500, #FFD60A, #34C759, #00C7BE, #007AFF, #5856D6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Color Archive
        </Link>

        <nav className="flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs font-medium transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}