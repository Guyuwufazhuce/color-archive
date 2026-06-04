export interface ColorPageData {
  slug: string;
  label: string;
  hue: string;
  hex: string;
  description: string;
  psychology: string;
  useCases: { title: string; description: string }[];
  swatches: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const colorPages: ColorPageData[] = [
  {
    slug: "red",
    label: "Red",
    hue: "345°–15°",
    hex: "#e74c3c",
    description:
      "Red is the color of energy, passion, and action. It is one of the most visible and emotionally intense colors in the spectrum, often used to grab attention and convey urgency. From fire and blood to roses and sunsets, red appears throughout nature as a signal of power and vitality.",
    psychology:
      "Red is psychologically associated with excitement, strength, and desire. It increases heart rate and creates a sense of urgency, making it a powerful tool in marketing and design. Red stimulates appetite — which is why many restaurants use it — and also signals danger or warning. Culturally, red represents luck and prosperity in East Asian traditions, while in Western contexts it often symbolizes love and romance.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Red is used by major brands like Coca-Cola, Netflix, and YouTube to project energy and command attention. It works well for logos that need to be memorable and impactful.",
      },
      {
        title: "UI Design",
        description:
          "In interfaces, red is commonly used for error states, destructive actions (delete buttons), and badges that need immediate visibility. Use it sparingly to avoid visual fatigue.",
      },
      {
        title: "Poster Design",
        description:
          "Red dominates movie posters, event flyers, and sale banners. Its high contrast against dark or neutral backgrounds makes it ideal for headlines and call-to-action elements.",
      },
      {
        title: "Fashion Design",
        description:
          "A red garment or accessory instantly becomes a statement piece. Red lipstick and nail polish are timeless staples, and red accents in streetwear or formal wear add boldness.",
      },
    ],
    swatches: [
      "#e74c3c",
      "#c0392b",
      "#ff6b6b",
      "#d63031",
      "#e17055",
      "#b71540",
      "#ff4757",
      "#eb2f06",
    ],
    seo: {
      title: "Red Color Collection — Sort & Explore Red Images",
      description:
        "Browse images sorted by red color family. Learn about red color psychology, design uses, and view an auto-generated red palette. Free online tool.",
      keywords: [
        "red color",
        "red images",
        "red palette",
        "red color collection",
        "red in design",
        "red psychology",
      ],
    },
  },
  {
    slug: "orange",
    label: "Orange",
    hue: "15°–45°",
    hex: "#e67e22",
    description:
      "Orange blends the energy of red with the happiness of yellow. It is a warm, vibrant color that evokes feelings of enthusiasm, creativity, and warmth. Found in autumn leaves, citrus fruits, and sunsets, orange is naturally associated with change and harvest.",
    psychology:
      "Orange is psychologically stimulating without being as aggressive as red. It promotes enthusiasm, creativity, and determination. As a social color, it encourages conversation and is often used in spaces designed for interaction. Orange is also associated with affordability and approachability — which is why budget brands and discount retailers frequently use it.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Orange is used by brands like Fanta, Nickelodeon, and Harley-Davidson to convey fun, energy, and a youthful spirit. It works well for creative agencies and entertainment brands.",
      },
      {
        title: "UI Design",
        description:
          "Orange works effectively for call-to-action buttons and highlights in dashboards. It offers strong contrast without the aggressiveness of red, making it suitable for subscription prompts and upgrade banners.",
      },
      {
        title: "Poster Design",
        description:
          "Autumn-themed posters, music festival flyers, and food promotions benefit from orange's warm and appetizing qualities. It pairs well with dark blues or teals for a striking complementary scheme.",
      },
      {
        title: "Fashion Design",
        description:
          "Orange has gained popularity in streetwear and activewear. Burnt orange and terracotta tones have become staples in contemporary fashion collections.",
      },
    ],
    swatches: [
      "#e67e22",
      "#d35400",
      "#f39c12",
      "#e17055",
      "#ff9ff3",
      "#f0932b",
      "#cc8e35",
      "#b33939",
    ],
    seo: {
      title: "Orange Color Collection — Sort & Explore Orange Images",
      description:
        "Browse images sorted by orange color family. Learn about orange color psychology, design uses, and view an auto-generated orange palette.",
      keywords: [
        "orange color",
        "orange images",
        "orange palette",
        "orange color collection",
        "orange in design",
        "orange psychology",
      ],
    },
  },
  {
    slug: "yellow",
    label: "Yellow",
    hue: "45°–70°",
    hex: "#f1c40f",
    description:
      "Yellow is the color of sunshine, optimism, and joy. As the brightest color in the visible spectrum, it naturally attracts the eye and lifts the spirit. Found in sunflowers, lemons, stars, and warning signs, yellow commands attention like no other hue.",
    psychology:
      "Yellow is psychologically associated with happiness, warmth, and mental clarity. It stimulates the left brain — the logical side — making it conducive to analytical thinking. However, prolonged exposure to bright yellow can cause visual fatigue. In design, yellow is used to create a sense of optimism and to draw immediate attention. It is also the most visible color from a distance, making it ideal for warning signs and taxis.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Yellow is used by brands like McDonald's, IKEA, and National Geographic to project warmth, happiness, and accessibility. It works well paired with dark text for high readability.",
      },
      {
        title: "UI Design",
        description:
          "Yellow is effective for rating stars, badges, and status indicators. It can highlight special offers or new features. Use muted or golden yellows for a more sophisticated look.",
      },
      {
        title: "Poster Design",
        description:
          "Yellow backgrounds make bold typography pop. It's excellent for children's events, summer promotions, and music festival posters. Combine yellow with black for maximum visual impact.",
      },
      {
        title: "Fashion Design",
        description:
          "Yellow dresses, accessories, and accent pieces bring energy to any outfit. Mustard yellow and pastel yellow have become popular alternatives to bright yellow in contemporary fashion.",
      },
    ],
    swatches: [
      "#f1c40f",
      "#f39c12",
      "#ffeaa7",
      "#ffd32a",
      "#fdcb6e",
      "#e1b12c",
      "#ffc312",
      "#fed330",
    ],
    seo: {
      title: "Yellow Color Collection — Sort & Explore Yellow Images",
      description:
        "Browse images sorted by yellow color family. Learn about yellow color psychology, design uses, and view an auto-generated yellow palette.",
      keywords: [
        "yellow color",
        "yellow images",
        "yellow palette",
        "yellow color collection",
        "yellow in design",
        "yellow psychology",
      ],
    },
  },
  {
    slug: "green",
    label: "Green",
    hue: "70°–170°",
    hex: "#2ecc71",
    description:
      "Green is the color of nature, growth, and harmony. As the most abundant color in the natural world, it symbolizes life, renewal, and environmental consciousness. From lush forests to fresh leaves, green represents balance and stability.",
    psychology:
      "Green is psychologically the most restful color for the human eye, capable of reducing stress and promoting calm. It is associated with health, prosperity, and environmental awareness. Dark greens convey wealth and tradition, while bright greens suggest freshness and vitality. In color psychology, green is believed to encourage balance, self-control, and harmony.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Green is favored by eco-conscious brands, financial institutions, and health organizations. Companies like Starbucks, Whole Foods, and Spotify use green to communicate natural, trustworthy values.",
      },
      {
        title: "UI Design",
        description:
          "Green is commonly used for success states, confirmation messages, and progress indicators. It works well in dashboards for positive metrics and growth charts.",
      },
      {
        title: "Poster Design",
        description:
          "Green is ideal for environmental campaigns, outdoor events, and health-related posters. It pairs beautifully with earth tones and natural textures.",
      },
      {
        title: "Fashion Design",
        description:
          "Olive green and sage have become wardrobe staples in contemporary fashion. Emerald green adds luxury to evening wear, while lime green makes bold streetwear statements.",
      },
    ],
    swatches: [
      "#2ecc71",
      "#27ae60",
      "#55efc4",
      "#00b894",
      "#81ecec",
      "#00cec9",
      "#a2d9ce",
      "#52be80",
    ],
    seo: {
      title: "Green Color Collection — Sort & Explore Green Images",
      description:
        "Browse images sorted by green color family. Learn about green color psychology, design uses, and view an auto-generated green palette.",
      keywords: [
        "green color",
        "green images",
        "green palette",
        "green color collection",
        "green in design",
        "green psychology",
      ],
    },
  },
  {
    slug: "cyan",
    label: "Cyan",
    hue: "170°–200°",
    hex: "#1abc9c",
    description:
      "Cyan sits between green and blue on the color wheel, evoking the clarity of tropical waters and the vastness of the open sky. It is a color of tranquility, refreshment, and modern sophistication. Often associated with cleanliness and technology, cyan brings a crisp, contemporary feel to any design.",
    psychology:
      "Cyan promotes mental clarity, focus, and a sense of spaciousness. It is less emotional than blue and more energetic than green, making it ideal for environments that require concentration and clear thinking. In design, cyan is perceived as modern, clean, and approachable — it is frequently used in tech interfaces and healthcare branding to project professionalism and calm efficiency.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Cyan is prevalent in technology and telecommunications branding. It conveys innovation and clarity, making it suitable for SaaS products, cloud services, and modern startups.",
      },
      {
        title: "UI Design",
        description:
          "Cyan is excellent for link styling, accent borders, and interactive elements. It provides a refreshing alternative to standard blue in modern interface designs.",
      },
      {
        title: "Poster Design",
        description:
          "Cyan works beautifully in minimalist and tech-themed posters. Combined with white or light backgrounds, it creates a clean, breathable aesthetic ideal for modern events.",
      },
      {
        title: "Fashion Design",
        description:
          "Cyan and teal shades have become popular in swimwear, activewear, and casual fashion. The color is associated with a cool, contemporary style.",
      },
    ],
    swatches: [
      "#1abc9c",
      "#16a085",
      "#00d2d3",
      "#01a3a4",
      "#55efc4",
      "#00b894",
      "#81ecec",
      "#00cec9",
    ],
    seo: {
      title: "Cyan Color Collection — Sort & Explore Cyan Images",
      description:
        "Browse images sorted by cyan color family. Learn about cyan color psychology, design uses, and view an auto-generated cyan palette.",
      keywords: [
        "cyan color",
        "cyan images",
        "cyan palette",
        "cyan color collection",
        "teal design",
        "cyan psychology",
      ],
    },
  },
  {
    slug: "blue",
    label: "Blue",
    hue: "200°–250°",
    hex: "#3498db",
    description:
      "Blue is the color of trust, stability, and wisdom. It is the most universally preferred color across cultures and is deeply associated with the sky, the ocean, and the infinite. Blue conveys professionalism, reliability, and calm authority.",
    psychology:
      "Blue is psychologically calming, lowering heart rate and creating an atmosphere of peace and security. It is associated with intelligence, communication, and trust — which is why banks, insurance companies, and social media platforms overwhelmingly favor it. Dark blues project authority and expertise, while lighter blues suggest approachability and serenity. Blue also suppresses appetite, making it uncommon in food branding.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Blue dominates corporate branding. Facebook, Twitter/X, LinkedIn, and PayPal all use blue to communicate trust and reliability. It's the safest choice for professional services.",
      },
      {
        title: "UI Design",
        description:
          "Blue is the default color for links and interactive elements in most interfaces. It represents actions, navigation, and information. Dark blue works well for headers and footer backgrounds.",
      },
      {
        title: "Poster Design",
        description:
          "Blue is versatile for everything from corporate events to music festivals. Deep navy conveys elegance, while sky blue works for outdoor and travel-themed posters.",
      },
      {
        title: "Fashion Design",
        description:
          "Denim blue is a fashion cornerstone. Navy suits are a professional staple, and cobalt blue adds a pop of color to any wardrobe. Blue is universally flattering across skin tones.",
      },
    ],
    swatches: [
      "#3498db",
      "#2980b9",
      "#74b9ff",
      "#0984e3",
      "#a29bfe",
      "#6c5ce7",
      "#48dbfb",
      "#0abde3",
    ],
    seo: {
      title: "Blue Color Collection — Sort & Explore Blue Images",
      description:
        "Browse images sorted by blue color family. Learn about blue color psychology, design uses, and view an auto-generated blue palette.",
      keywords: [
        "blue color",
        "blue images",
        "blue palette",
        "blue color collection",
        "blue in design",
        "blue psychology",
      ],
    },
  },
  {
    slug: "purple",
    label: "Purple",
    hue: "250°–290°",
    hex: "#9b59b6",
    description:
      "Purple sits at the intersection of the stability of blue and the energy of red. Long associated with royalty, spirituality, and mystery, purple carries an air of sophistication and creativity. It is the color of imagination and luxury.",
    psychology:
      "Purple is psychologically associated with wisdom, creativity, and mystery. Lighter lavenders evoke nostalgia and sentimentality, while deep purples suggest luxury and exclusivity. Historically, purple dye was rare and expensive, making it the color of royalty and the upper class. In modern contexts, purple is used to convey premium quality, artistic expression, and spiritual depth.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Purple is used by premium and creative brands. Cadbury, Hallmark, and Twitch use purple to stand out from competitors and convey a sense of uniqueness and quality.",
      },
      {
        title: "UI Design",
        description:
          "Purple works well for creative tools, meditation apps, and beauty products. It can indicate premium features or memberships in interface design.",
      },
      {
        title: "Poster Design",
        description:
          "Purple is ideal for music posters, art exhibitions, and fantasy-themed events. It creates a dreamy, atmospheric quality that pairs well with gold or silver accents.",
      },
      {
        title: "Fashion Design",
        description:
          "Purple has become increasingly popular in contemporary fashion. Lavender suits and purple accessories add a distinctive touch to modern wardrobes.",
      },
    ],
    swatches: [
      "#9b59b6",
      "#8e44ad",
      "#a29bfe",
      "#6c5ce7",
      "#fd79a8",
      "#e84393",
      "#6c5ce7",
      "#4834d4",
    ],
    seo: {
      title: "Purple Color Collection — Sort & Explore Purple Images",
      description:
        "Browse images sorted by purple color family. Learn about purple color psychology, design uses, and view an auto-generated purple palette.",
      keywords: [
        "purple color",
        "purple images",
        "purple palette",
        "purple color collection",
        "purple in design",
        "purple psychology",
      ],
    },
  },
  {
    slug: "pink",
    label: "Pink",
    hue: "290°–345°",
    hex: "#e84393",
    description:
      "Pink is the color of compassion, playfulness, and warmth. Blending the energy of red with the purity of white, pink ranges from delicate blush to vibrant magenta. It is associated with love, tenderness, and modern femininity.",
    psychology:
      "Pink is psychologically calming and nurturing. Unlike red's aggressive energy, pink promotes feelings of comfort, care, and affection. Bright pinks convey playfulness and confidence, while dusty roses suggest sophistication and maturity. In contemporary branding, pink has been reclaimed as a bold, empowering color, particularly in the beauty and fashion industries.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Pink is used by beauty brands, fashion labels, and lifestyle products. Companies like T-Mobile, Barbie, and Benefit Cosmetics use pink to project fun and approachability.",
      },
      {
        title: "UI Design",
        description:
          "Pink can be used for feature highlights, badges, and accent elements in feminine-focused products. It works well in lifestyle apps, e-commerce, and creative tools.",
      },
      {
        title: "Poster Design",
        description:
          "Pink is effective for fashion shows, beauty events, Valentine's Day promotions, and charity runs. Hot pink grabs attention, while soft pink creates an elegant backdrop.",
      },
      {
        title: "Fashion Design",
        description:
          "Pink has transcended gender stereotypes in contemporary fashion. Millennial pink, hot pink activewear, and blush accessories are mainstream staples.",
      },
    ],
    swatches: [
      "#e84393",
      "#fd79a8",
      "#d63031",
      "#e17055",
      "#ff9ff3",
      "#f368e0",
      "#ff7f50",
      "#ff4757",
    ],
    seo: {
      title: "Pink Color Collection — Sort & Explore Pink Images",
      description:
        "Browse images sorted by pink color family. Learn about pink color psychology, design uses, and view an auto-generated pink palette.",
      keywords: [
        "pink color",
        "pink images",
        "pink palette",
        "pink color collection",
        "pink in design",
        "pink psychology",
      ],
    },
  },
  {
    slug: "brown",
    label: "Brown",
    hue: "Low-light, low-sat",
    hex: "#8b5e3c",
    description:
      "Brown is the color of earth, wood, and stability. It is the most grounding color in the spectrum, evoking feelings of warmth, reliability, and connection to nature. From rich soil to aged leather, brown represents authenticity and durability.",
    psychology:
      "Brown is psychologically associated with stability, security, and comfort. It is a natural, organic color that feels trustworthy and grounded. Brown can feel warm and inviting in interior spaces, but can also be perceived as dull or conservative if overused. In design, brown is valued for its ability to create a sense of substance and timelessness.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Brown is used by brands that want to communicate durability and natural values. UPS, M&M's, and Hershey's use brown to convey reliability and earthy authenticity.",
      },
      {
        title: "UI Design",
        description:
          "Brown works well in designs for coffee shops, bookstores, and eco-friendly products. It creates warm, inviting interfaces when paired with cream or beige tones.",
      },
      {
        title: "Poster Design",
        description:
          "Brown is effective for rustic, vintage, and organic themed posters. It pairs beautifully with cream, sage green, and terracotta for nature-inspired designs.",
      },
      {
        title: "Fashion Design",
        description:
          "Brown leather goods, boots, and accessories are timeless wardrobe investments. Brown and tan have seen a resurgence in minimalist and heritage-inspired fashion.",
      },
    ],
    swatches: [
      "#8b5e3c",
      "#a0522d",
      "#d4a574",
      "#c17a5d",
      "#b8860b",
      "#cd853f",
      "#bc8f8f",
      "#a67b5b",
    ],
    seo: {
      title: "Brown Color Collection — Sort & Explore Brown Images",
      description:
        "Browse images sorted by brown color family. Learn about brown color psychology, design uses, and view an auto-generated brown palette.",
      keywords: [
        "brown color",
        "brown images",
        "brown palette",
        "brown color collection",
        "brown in design",
        "brown psychology",
      ],
    },
  },
  {
    slug: "grayscale",
    label: "Grayscale",
    hue: "Low saturation",
    hex: "#7f8c8d",
    description:
      "Grayscale encompasses the range from pure white through countless shades of gray to absolute black. It is the foundation of value, contrast, and form in visual design. Without the distraction of color, grayscale emphasizes texture, shape, and composition.",
    psychology:
      "Grayscale colors are psychologically associated with neutrality, balance, and sophistication. White represents purity and clarity. Black conveys power and elegance. Gray is practical, timeless, and conservative. In design, grayscale provides structure and hierarchy, allowing accent colors to stand out. A monochrome palette can feel modern, minimalist, and highly refined.",
    useCases: [
      {
        title: "Brand Design",
        description:
          "Grayscale logos convey sophistication and timelessness. Brands like Apple, Nike, and Chanel use black extensively for premium positioning. Gray works for professional services and technology.",
      },
      {
        title: "UI Design",
        description:
          "Grayscale is fundamental to UI design. Text, backgrounds, borders, shadows, and icons all rely on value hierarchy. Dark mode interfaces are built on grayscale foundations.",
      },
      {
        title: "Poster Design",
        description:
          "Black and white posters have a timeless, artistic quality. Grayscale photography emphasizes emotion and form, making it powerful for fine art and film posters.",
      },
      {
        title: "Fashion Design",
        description:
          "Monochrome outfits are a staple of minimalist fashion. A well-tailored black suit or a white dress is timeless. Grayscale allows texture and silhouette to take center stage.",
      },
    ],
    swatches: [
      "#f5f6fa",
      "#dcdde1",
      "#b2bec3",
      "#636e72",
      "#2d3436",
      "#dfe6e9",
      "#747d8c",
      "#1e272e",
    ],
    seo: {
      title: "Grayscale Color Collection — Sort & Explore Black & White Images",
      description:
        "Browse images sorted by grayscale. Learn about black, white, and gray color psychology, design uses, and view an auto-generated grayscale palette.",
      keywords: [
        "grayscale",
        "black and white images",
        "grayscale palette",
        "monochrome design",
        "black white gray",
        "grayscale photography",
      ],
    },
  },
];

export function getColorPage(slug: string): ColorPageData | undefined {
  return colorPages.find((c) => c.slug === slug);
}

export function getColorPageByLabel(
  label: string
): ColorPageData | undefined {
  return colorPages.find(
    (c) => c.label.toLowerCase() === label.toLowerCase()
  );
}