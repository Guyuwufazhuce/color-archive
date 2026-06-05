import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use - Color Archive",
  description:
    "Terms of Use for Color Archive. By using this site, you agree to these terms governing content, copyright, and site usage.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        Terms of Use
      </h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        Users must use this website in compliance with all applicable laws and
        regulations.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        Uploading illegal, harmful, or infringing content is strictly
        prohibited.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        Users may not upload content that violates the copyright or
        intellectual property rights of others.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        This website does not guarantee permanent storage of user-uploaded
        images. Images may be removed or lost without notice.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        The website reserves the right to remove content and restrict access
        to users who violate these terms.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed">
        By continuing to use this website, you agree to these Terms of Use.
      </p>
    </main>
  );
}