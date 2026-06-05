import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-center gap-6">
        <Link href="/about" className="text-[12px] text-gray-300 hover:text-gray-500 transition-colors">
          About
        </Link>
        <Link href="/privacy" className="text-[12px] text-gray-300 hover:text-gray-500 transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="text-[12px] text-gray-300 hover:text-gray-500 transition-colors">
          Terms
        </Link>
        <Link href="/contact" className="text-[12px] text-gray-300 hover:text-gray-500 transition-colors">
          Contact
        </Link>
        <span className="text-[12px] text-gray-200">&copy; Color Archive</span>
      </div>
    </footer>
  );
}