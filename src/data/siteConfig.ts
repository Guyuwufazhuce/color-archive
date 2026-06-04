export const siteConfig = {
  name: "Color Archive",
  tagline: "Sort your images by color automatically.",
  description:
    "Color Archive is a free online tool that automatically extracts dominant colors from your images and sorts them by color family. Organize your image collection by color — no upload required, all processing happens in your browser.",
  url: "https://color-archive.com",
  author: "Color Archive",
  copyright: `© ${new Date().getFullYear()} Color Archive. All rights reserved.`,
  email: "hello@color-archive.com",

  nav: [
    { label: "Home", href: "/" },
    { label: "Gallery", href: "/gallery" },
    { label: "Colors", href: "/colors" },
    { label: "Guides", href: "/guide" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  footer: {
    description:
      "Color Archive helps designers, artists, and creators organize images by color. All processing happens locally in your browser.",
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  },
} as const;