export const siteConfig = {
  name: "Color Archive",
  tagline: "Upload images and browse them by color.",
  description: "Upload images and browse them by color.",
  url: "https://color-archive.com",
  copyright: `© ${new Date().getFullYear()} Color Archive.`,

  nav: [
    { label: "Color Archive", href: "/" },
    { label: "Gallery", href: "/gallery" },
  ],

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  },
} as const;