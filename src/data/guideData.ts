export interface GuideData {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  sections: { heading: string; content: string }[];
  faq: { q: string; a: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const guidePages: GuideData[] = [
  {
    slug: "color-psychology",
    title: "Color Psychology: How Colors Influence Emotion and Behavior",
    description:
      "A comprehensive guide to color psychology — how different colors affect human emotions, decision-making, and brand perception. Learn the science behind color choices in design and marketing.",
    category: "Color Theory",
    readTime: "8 min read",
    sections: [
      {
        heading: "What Is Color Psychology?",
        content:
          "Color psychology is the study of how colors affect human perception, emotion, and behavior. While color perception is subjective and influenced by personal experience, culture, and context, certain color associations have been observed consistently across populations. Understanding these patterns is essential for designers, marketers, and artists who want to communicate effectively through color.\n\nColor psychology draws from multiple disciplines including neuroscience, evolutionary biology, and cultural anthropology. The way we respond to color is both physiological — certain wavelengths trigger specific neural responses — and learned, shaped by cultural associations and personal experiences accumulated over a lifetime.",
      },
      {
        heading: "The Science Behind Color Perception",
        content:
          "Human color vision relies on cone cells in the retina that are sensitive to different wavelengths of light. The three types of cones respond to short (blue), medium (green), and long (red) wavelengths. These signals are processed by the brain in complex ways that influence not just what we see, but how we feel.\n\nResearch has shown that colors can affect physiological responses. Red has been demonstrated to increase heart rate and blood pressure. Blue promotes calmness and can lower stress levels. Yellow stimulates mental activity and can enhance concentration. These responses are rooted in evolutionary adaptations — red signaled ripeness or danger, blue meant clear skies and safety, green indicated fertile environments.",
      },
      {
        heading: "Warm Colors: Red, Orange, Yellow",
        content:
          "Warm colors (red, orange, yellow) are associated with energy, warmth, and action. They advance visually, making objects appear closer and larger. Red is the most emotionally intense, increasing heart rate and creating urgency. Orange blends red's energy with yellow's happiness, making it feel friendly and inviting. Yellow is the most visible and optimistic, stimulating mental activity but potentially causing eye strain in large doses.\n\nIn design, warm colors are excellent for call-to-action buttons, sale banners, and elements that need immediate attention. They create a sense of excitement and can make spaces feel cozier and more intimate.",
      },
      {
        heading: "Cool Colors: Green, Blue, Purple",
        content:
          "Cool colors (green, blue, purple) are associated with calm, trust, and professionalism. They recede visually, making objects appear smaller and further away. Green is the most restful color for the eye and is associated with nature, health, and balance. Blue is the most universally preferred color, conveying trust, stability, and intelligence. Purple combines the stability of blue with the energy of red, suggesting creativity, luxury, and spirituality.\n\nIn design, cool colors work well for backgrounds, professional branding, and interfaces that need to feel trustworthy and calming. They are widely used in healthcare, finance, and technology sectors.",
      },
      {
        heading: "Neutral Colors: Black, White, Gray, Brown",
        content:
          "Neutral colors provide the foundation for most design systems. Black conveys power, sophistication, and authority. White represents purity, clarity, and simplicity. Gray is practical, timeless, and balanced. Brown is grounded, warm, and natural.\n\nNeutrals are essential for creating hierarchy and readability in design. They give structure to layouts and allow accent colors to stand out. A well-designed neutral palette is the backbone of effective visual communication.",
      },
      {
        heading: "Cultural Differences in Color Perception",
        content:
          "Color meanings vary significantly across cultures. White symbolizes purity in Western cultures but is associated with mourning in many Eastern traditions. Red means luck and prosperity in China but can signal danger in Western contexts. Green is associated with nature in most cultures but has specific religious significance in Islamic societies.\n\nWhen designing for global audiences, understanding these cultural variations is crucial. A color choice that works well in one market may have unintended negative connotations in another. Research your target audience's cultural associations before finalizing a color palette.",
      },
      {
        heading: "Applying Color Psychology in Design",
        content:
          "Effective use of color psychology starts with understanding your goals. What emotion or action do you want to evoke? Red for urgency (sale banners, clearance items). Blue for trust (banking, healthcare, technology). Green for growth (environmental brands, wellness). Purple for luxury (premium products, beauty). Yellow for optimism (children's brands, happiness).\n\nConsider contrast and accessibility too. High-contrast color combinations improve readability for users with visual impairments. Tools like the Web Content Accessibility Guidelines (WCAG) provide standards for color contrast ratios that ensure your design is usable by everyone.",
      },
    ],
    faq: [
      {
        q: "What is the most trustworthy color?",
        a: "Blue is consistently rated as the most trustworthy color across multiple studies. It evokes feelings of stability, security, and professionalism, which is why banks, insurance companies, and social media platforms predominantly use blue in their branding.",
      },
      {
        q: "Which color increases sales the most?",
        a: "Red is highly effective for impulse purchases and clearance sales because it creates urgency. However, blue tends to work better for high-involvement purchases where trust is important. The best color for sales ultimately depends on your brand identity and target audience.",
      },
      {
        q: "Can colors affect productivity?",
        a: "Yes. Blue environments promote focus and productivity, making them ideal for offices and study spaces. Green reduces eye strain and promotes calm concentration. Yellow stimulates creativity but can cause anxiety in large amounts. Red can be overstimulating in work environments.",
      },
      {
        q: "How does color affect food perception?",
        a: "Red and yellow are known to stimulate appetite, which is why many fast-food restaurants use these colors. Blue and purple suppress appetite — blue food is rare in nature and may signal spoilage. Green suggests freshness and health, making it popular for organic and health food branding.",
      },
    ],
    seo: {
      title: "Color Psychology Guide — How Colors Influence Emotion & Behavior",
      description:
        "A comprehensive guide to color psychology. Learn how red, blue, green, and other colors affect human emotions, decision-making, and brand perception. Essential reading for designers and marketers.",
      keywords: [
        "color psychology",
        "color meaning",
        "color emotion",
        "psychology of color",
        "color perception",
        "color theory psychology",
        "how colors affect mood",
      ],
    },
  },
  {
    slug: "how-to-organize-images-by-color",
    title: "How to Organize Images by Color: A Complete Guide",
    description:
      "Learn how to organize your image collection by color. From manual sorting to automated tools, discover the best methods for creating color-based image archives for design, photography, and creative work.",
    category: "Image Organization",
    readTime: "10 min read",
    sections: [
      {
        heading: "Why Organize Images by Color?",
        content:
          "Organizing images by color is a powerful technique used by designers, photographers, and creatives to streamline their workflow. When you can instantly find images that match a specific color palette, your creative process becomes faster and more intuitive.\n\nColor-based organization helps with mood board creation, brand consistency checking, palette inspiration, presentation building, and social media content planning. Rather than scrolling through folders of unsorted images, a color-categorized library lets you find exactly what you need by thinking in terms of hue and tone.",
      },
      {
        heading: "The Traditional Approach: Manual Sorting",
        content:
          "Before automated tools became widely available, designers would manually sort their image libraries into color folders. This approach involves creating folders for each color family (red, orange, yellow, green, blue, purple, pink, brown, grayscale) and dragging images into the appropriate category.\n\nManual sorting has the advantage of being precise — your eye can detect subtle color nuances that algorithms might miss. However, it is time-consuming and doesn't scale well. For collections of hundreds or thousands of images, manual sorting becomes impractical. Additionally, many images contain multiple colors, making it difficult to decide where they belong.",
      },
      {
        heading: "Automated Color Analysis: How It Works",
        content:
          "Modern color analysis tools use algorithms to extract dominant colors from images automatically. The process typically involves:\n\n1. Sampling pixels from the image at a reduced resolution for performance\n2. Converting RGB values to HSL (hue, saturation, lightness) for perceptually meaningful analysis\n3. Clustering similar colors together using algorithms like k-means or median cut\n4. Filtering out background colors (near-white, near-black, or transparent pixels)\n5. Ranking the remaining color clusters by prominence\n6. Classifying the dominant color into a color family based on its hue value\n\nThis entire process happens in milliseconds per image and can be run entirely in the browser without uploading images to a server.",
      },
      {
        heading: "Setting Up a Color Classification System",
        content:
          "An effective color classification system requires well-defined color boundaries. Each color family should have clear hue ranges:\n\n- Red: 345°–15° and 315°–345°\n- Orange: 15°–45°\n- Yellow: 45°–70°\n- Green: 70°–170°\n- Cyan: 170°–200°\n- Blue: 200°–250°\n- Purple: 250°–290°\n- Pink: 290°–315° (and deep reds > 315°)\n- Brown: colors with low saturation and medium lightness\n- Grayscale: colors with very low saturation\n\nClassifying by these ranges ensures consistent categorization. Remember that some images may be ambiguous — you might want to allow manual reclassification for edge cases.",
      },
      {
        heading: "Best Practices for Color Image Archives",
        content:
          "To build an effective color-based image archive:\n\n1. Start with a cleanup — remove duplicates, low-quality images, and irrelevant files before categorizing\n2. Use a consistent naming convention for your image files\n3. Consider tagging images with multiple colors if they contain more than one dominant color\n4. Allow manual overrides — automated classification is a starting point, not the final word\n5. Export your classification data for use in other tools and workflows\n6. Regularly review and update your archive as your collection grows\n7. Back up your categorized collection to prevent data loss",
      },
      {
        heading: "Using Color Archives in Creative Workflows",
        content:
          "A well-organized color archive integrates into various creative workflows:\n\n- Mood boarding: Quickly find images that match your project's color palette\n- Client presentations: Show brand-compatible imagery with confidence\n- Social media: Maintain consistent color themes across your posts\n- Print design: Locate images that work with your print color scheme\n- Web design: Find hero images that complement your site's color palette\n- Photography: Analyze your portfolio's color distribution and identify gaps",
      },
    ],
    faq: [
      {
        q: "What is the best way to sort images by color?",
        a: "The best approach combines automated color analysis with manual refinement. Use a tool that extracts dominant colors and classifies them automatically, then manually review and reclassify edge cases. This gives you speed without sacrificing accuracy.",
      },
      {
        q: "Can I organize images by color without uploading them?",
        a: "Yes. Modern tools like Color Archive run entirely in your browser using the Canvas API. Images never leave your computer — all color analysis happens locally, protecting your privacy and ensuring fast processing.",
      },
      {
        q: "How accurate is automated color classification?",
        a: "Accuracy depends on the algorithm and the image complexity. Most color analysis tools achieve 85-95% accuracy for images with a clear dominant color. Images with complex, varied color palettes may require manual classification. The best tools allow you to override the automated result.",
      },
      {
        q: "How many color categories should I use?",
        a: "10-12 color categories is ideal for most collections. Standard categories include red, orange, yellow, green, cyan, blue, purple, pink, brown, and grayscale. This provides enough granularity without being overwhelming.",
      },
    ],
    seo: {
      title: "How to Organize Images by Color — Complete Guide 2026",
      description:
        "Learn how to organize your image collection by color. From manual sorting to automated in-browser tools, discover the best methods for creating color-based image archives for designers and creatives.",
      keywords: [
        "organize images by color",
        "color sorting images",
        "image color classification",
        "sort photos by color",
        "color archive guide",
        "organize photo library by color",
      ],
    },
  },
  {
    slug: "best-color-palettes",
    title: "Best Color Palettes for Design Projects in 2026",
    description:
      "Discover the most popular color palettes for design projects this year. From modern minimalism to bold maximalism, find curated color combinations for branding, UI, and print design.",
    category: "Color Palettes",
    readTime: "7 min read",
    sections: [
      {
        heading: "Why Color Palettes Matter",
        content:
          "A well-chosen color palette is the foundation of effective design. Colors create mood, convey meaning, and guide the viewer's eye. The right palette can make your design memorable and emotionally resonant, while a poorly chosen palette can undermine even the most thoughtful layout.\n\nGreat color palettes follow principles of color theory — complementary colors create contrast, analogous colors create harmony, and triadic combinations create visual interest. Understanding these relationships allows designers to make intentional, effective color choices.",
      },
      {
        heading: "Modern Minimalist Palettes",
        content:
          "Minimalist color palettes continue to dominate digital design in 2026. These palettes typically feature 2-3 colors with a heavy reliance on neutrals:\n\n- Warm Minimal: Off-white (#f5f0eb), Warm Gray (#8c7e72), Terracotta (#c1694f)\n- Cool Minimal: Ivory (#faf8f5), Slate (#475569), Navy (#1e293b)\n- Monochrome: Three shades of the same hue, like #f0f4ff, #4f7cff, #1a365d\n\nThese palettes are highly versatile, work well for both web and print, and create a sense of sophistication and clarity.",
      },
      {
        heading: "Bold and Vibrant Palettes",
        content:
          "For projects that demand attention, bold palettes combine saturated colors:\n\n- Electric: Cyan (#00d4ff), Magenta (#ff0080), Black (#000000)\n- Sunset: Orange (#ff6b35), Pink (#ff006e), Purple (#8338ec)\n- Tropical: Coral (#ff6b6b), Green (#06d6a0), Yellow (#ffd166)\n\nBold palettes work best for entertainment, fashion, and creative brands. Use them sparingly — let the colors breathe with adequate white space.",
      },
      {
        heading: "Nature-Inspired Palettes",
        content:
          "Biophilic design and sustainability trends have made nature-inspired palettes increasingly popular:\n\n- Forest: Moss Green (#4a7c59), Bark Brown (#5c4033), Sky (#a8c5da)\n- Ocean: Deep Blue (#003049), Teal (#008080), Sand (#f4e4c1)\n- Desert: Terracotta (#d4815c), Sand (#eab676), Sage (#9caf83)\n\nThese palettes feel calming, authentic, and timeless. They are excellent for wellness brands, hospitality, and outdoor-focused products.",
      },
      {
        heading: "UI/UX Color Palettes",
        content:
          "Effective UI palettes prioritize usability and accessibility:\n\n- Primary: The brand's main color, used for key interactive elements\n- Secondary: A complementary color for variety and hierarchy\n- Accent: A contrasting color for highlights and calls-to-action\n- Neutral: 5-9 shades of gray for text, backgrounds, borders, and surfaces\n- Semantic: Green (success), Red (error), Yellow (warning), Blue (info)\n\nAlways check contrast ratios against WCAG standards. Tools like Coolors and Adobe Color can help generate accessible palettes.",
      },
    ],
    faq: [
      {
        q: "How many colors should a palette have?",
        a: "Most design projects work well with 3-5 colors. A primary, secondary, and accent color plus 2-3 neutrals provides enough variety without becoming chaotic. For UI projects, you may need additional semantic colors for system feedback.",
      },
      {
        q: "What color palette is best for a professional brand?",
        a: "Professional brands typically benefit from blue-based palettes (trust, stability), complemented by a neutral secondary and a muted accent. Examples include navy blue + warm gray + gold, or slate blue + white + forest green.",
      },
      {
        q: "How do I create a color palette from an image?",
        a: "Use a color extraction tool like Color Archive. Upload an image with the mood you want, and the tool will identify its dominant colors. You can then refine and build a palette around those colors.",
      },
    ],
    seo: {
      title: "Best Color Palettes for Design Projects — 2026 Curated Collection",
      description:
        "Discover the most popular color palettes for branding, UI, and print design in 2026. From modern minimalist to bold vibrant palettes, find curated color combinations for your next project.",
      keywords: [
        "color palettes",
        "best color combinations",
        "design color palette",
        "color scheme ideas",
        "brand color palette",
        "UI color palette",
        "modern color palette 2026",
      ],
    },
  },
  {
    slug: "color-combination-basics",
    title: "Color Combination Basics: A Designer's Guide to Color Harmony",
    description:
      "Learn the fundamentals of color combinations for design. Understand color wheel relationships, harmony types, and practical rules for creating beautiful color schemes every time.",
    category: "Color Theory",
    readTime: "9 min read",
    sections: [
      {
        heading: "Understanding the Color Wheel",
        content:
          "The color wheel is the foundation of color theory. It arranges colors by their spectral wavelengths into a circular diagram that reveals relationships between hues. The traditional color wheel consists of 12 colors: three primary, three secondary, and six tertiary.\n\nPrimary colors (red, yellow, blue) cannot be created by mixing other colors. Secondary colors (orange, green, purple) result from mixing two primaries. Tertiary colors (red-orange, yellow-orange, yellow-green, blue-green, blue-purple, red-purple) come from mixing a primary with an adjacent secondary.\n\nUnderstanding these relationships is essential for creating color combinations that feel intentional and harmonious.",
      },
      {
        heading: "Complementary Color Schemes",
        content:
          "Complementary colors sit opposite each other on the color wheel (red/green, blue/orange, purple/yellow). These pairs create maximum contrast and visual tension. When used together, they make each other appear more vibrant.\n\nComplementary schemes are excellent for emphasizing key elements. Use one color as the dominant hue and the other as an accent for best results. Pure complements at full saturation can be overwhelming — consider using muted or darkened versions.",
      },
      {
        heading: "Analogous Color Schemes",
        content:
          "Analogous colors sit next to each other on the color wheel (blue, blue-green, green). These schemes create harmonious, cohesive designs with low contrast. They feel natural and pleasing because adjacent colors share undertones.\n\nAnalogous palettes are ideal for creating calm, unified designs. Choose one color as the dominant hue, use a secondary for support, and the third for accents. Avoid using all colors at equal saturation — establish a clear hierarchy.",
      },
      {
        heading: "Triadic and Tetradic Schemes",
        content:
          "Triadic schemes use three colors evenly spaced on the color wheel (red, yellow, blue or orange, green, purple). They offer vibrant contrast while maintaining balance. This scheme works well for playful, energetic designs.\n\nTetradic (or double-complementary) schemes use four colors arranged into two complementary pairs. They offer the most variety but require careful balance. The key is to let one color dominate and use the others sparingly as accents.",
      },
      {
        heading: "The 60-30-10 Rule",
        content:
          "The 60-30-10 rule is a timeless interior design principle that applies perfectly to graphic design and UI. It dictates that 60% of your composition should use a dominant color (usually a neutral), 30% a secondary color, and 10% an accent color.\n\nThis ratio creates visual balance and hierarchy. The dominant color sets the overall tone. The secondary color adds variety and supports the dominant hue. The accent color draws attention to specific elements and creates focal points.",
      },
      {
        heading: "Common Color Mistakes to Avoid",
        content:
          "Even experienced designers make color mistakes. Here are the most common ones:\n\n1. Using too many colors — limit your palette to 3-5 colors maximum\n2. Ignoring contrast — ensure text is readable against its background\n3. Forgetting about accessibility — roughly 8% of men have some form of color blindness\n4. Using pure black — #000000 is rarely the best choice; try a very dark gray instead\n5. Matching saturation levels — let one color take priority in intensity\n6. Neglecting cultural context — research color meanings for your target audience",
      },
    ],
    faq: [
      {
        q: "What is the most visually appealing color combination?",
        a: "Blue and orange is widely considered one of the most appealing color combinations. They are complementary on the color wheel, creating natural visual interest. Blue's calm stability balances orange's warm energy.",
      },
      {
        q: "How do I choose colors that go together?",
        a: "Start with a color scheme type (complementary, analogous, triadic) and pick colors accordingly. Use a tool like the color wheel to find related hues. Consider the mood you want to create — warm colors for energy, cool colors for calm.",
      },
      {
        q: "Should I always follow color theory rules?",
        a: "Color theory rules are guidelines, not laws. Some of the most memorable designs break traditional rules intentionally. The key is understanding the rules first so you know when, why, and how to break them effectively.",
      },
    ],
    seo: {
      title: "Color Combination Basics — Designer's Guide to Color Harmony",
      description:
        "Learn the fundamentals of color combinations for design. Understand color wheel relationships, harmony types (complementary, analogous, triadic), and the 60-30-10 rule for beautiful color schemes.",
      keywords: [
        "color combination",
        "color harmony",
        "color theory basics",
        "color wheel guide",
        "complementary colors",
        "analogous colors",
        "color scheme rules",
      ],
    },
  },
];

export function getGuidePage(slug: string): GuideData | undefined {
  return guidePages.find((g) => g.slug === slug);
}