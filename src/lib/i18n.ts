// Translation dictionaries for English / Chinese
// Organized by page/section for maintainability

export type Locale = "en" | "zh";

type Dict = typeof dict.en;

function getNested(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback to key
    }
  }
  return typeof current === "string" ? current : path;
}

export function t(key: string, locale: Locale = "en"): string {
  return getNested(dict[locale] as unknown as Record<string, unknown>, key);
}

export function getDict(locale: Locale) {
  return dict[locale];
}

export const dict = {
  en: {
    // ── Language switcher ──
    language: {
      en: "EN",
      zh: "中文",
    },

    // ── Nav / Header ──
    nav: {
      home: "Home",
      gallery: "Gallery",
      colors: "Colors",
      guides: "Guides",
      about: "About",
      contact: "Contact",
      privacy: "Privacy Policy",
    },
    header: {
      searchPlaceholder: "Search HEX… (#ff0000)",
      searchPlaceholderMobile: "#ff0000",
    },

    // ── Upload zone (UploadZone.tsx) ──
    upload: {
      dropHere: "Drop images here, or click to select",
      supportedFormats: "JPG, PNG, WEBP supported",
    },

    // ── Home page (HomeClient.tsx + page.tsx) ──
    home: {
      heroTitle: "Sort your images by color.",
      heroDesc:
        "Drop any image and Color Archive automatically extracts its dominant colors and sorts it into the right color family. Share it with the community gallery. All processing happens in your browser.",
      processing: "Processing images...",
      imageCount: "{count} image",
      imageCountPlural: "{count} images",
      exportJson: "Export JSON",
      clearAll: "Clear All",
      confirmClear: "Clear all images?",
      filterAll: "All",
      getStarted: "Upload some images to get started",
      browseByColor: "Browse images by color",
      // Features
      feature1Title: "Browser-only processing",
      feature1Desc:
        "Your images never leave your device. All color analysis runs locally using the Canvas API. No uploads, no servers, no privacy concerns.",
      feature2Title: "10 color families",
      feature2Desc:
        "Images are automatically classified into red, orange, yellow, green, cyan, blue, purple, pink, brown, or grayscale. Manual override available for edge cases.",
      feature3Title: "Community gallery",
      feature3Desc:
        "Published images appear in the public gallery, browsable by color family. Explore the community library or contribute your own.",
    },

    // ── ImageCard ──
    imageCard: {
      deleteTitle: "Delete",
      published: "Published",
      publishing: "Publishing...",
      publishToGallery: "Publish to Gallery",
    },

    // ── Gallery (GalleryClient.tsx) ──
    gallery: {
      title: "Gallery",
      subtitle: "All community photos organized by color. Upload yours to contribute.",
      loading: "Loading photos...",
      empty: "No photos yet. Be the first to upload!",
      end: "You've reached the end — check back for new uploads",
    },

    // ── Collection (CollectionClient.tsx) ──
    collection: {
      title: "{label} Collection",
      subtitle: "Browse {label} photos submitted by the community.",
      loading: "Loading...",
      empty: "No {label} photos yet. Upload one to start the collection!",
      end: "You've reached the end",
    },

    // ── Photo Detail (PhotoDetailClient.tsx) ──
    photoDetail: {
      gallery: "Gallery",
      details: "Photo Details",
      dominantColor: "Dominant Color",
      colorFamily: "Color Family",
      uploaded: "Uploaded",
      moreIn: "More in {label}",
    },

    // ── Search (SearchClient.tsx) ──
    search: {
      title: "Search Results",
      subtitle: "Photos matching color {query}",
      searching: "Searching...",
      noResults: 'No photos found for "{query}"',
      trySearch: "Try searching with a HEX color like",
      orBrowse: "or browse",
      allPhotos: "all photos",
    },

    // ── CommunityStats ──
    communityStats: {
      title: "Community Stats",
      viewGallery: "View gallery →",
      totalPhotos: "Total Photos",
      activeColors: "Active Colors",
    },

    // ── LatestUploads ──
    latestUploads: {
      title: "Latest Uploads",
      viewAll: "View all →",
    },

    // ── Footer ──
    footer: {
      pages: "Pages",
      colors: "Colors",
      company: "Company",
      home: "Home",
      privacyPolicy: "Privacy Policy",
      description:
        "Color Archive helps designers, artists, and creators organize images by color. All processing happens locally in your browser.",
    },

    // ── Color families (for CATEGORY_LABELS-like use in UI) ──
    colorFamilies: {
      red: "Red",
      orange: "Orange",
      yellow: "Yellow",
      green: "Green",
      cyan: "Cyan",
      blue: "Blue",
      purple: "Purple",
      pink: "Pink",
      brown: "Brown",
      grayscale: "Grayscale",
      uncategorized: "Uncategorized",
    },

    // ── About page ──
    about: {
      title: "About",
      whatIs: "What is Color Archive?",
      whatIsDesc:
        "Color Archive is a free, browser-based tool that automatically analyzes images and organizes them by their dominant color family. Upload any image and our color analysis engine extracts the most prominent colors, classifies them into one of ten color categories (red, orange, yellow, green, cyan, blue, purple, pink, brown, or grayscale), and displays your collection in a clean, moodboard-style layout.",
      whyBuilt: "Why we built it",
      whyBuiltDesc:
        "As designers and creators ourselves, we found that organizing images by color was one of the most intuitive ways to browse visual collections — but most tools either required uploading to a server or didn't exist at all. We built Color Archive to solve this problem: a tool that works entirely in your browser, respects your privacy, and gets out of your way so you can focus on being creative.",
      privacy: "Privacy first",
      privacyDesc:
        "Color Archive processes all images locally using the browser's Canvas API. Your images are never uploaded to any server — they never leave your computer. We don't collect, store, or share your images or any personal information. For more details, see our",
      howWorks: "How it works",
      howWorksDesc:
        "When you upload an image, we compress it to a small width for performance, sample its pixels using the Canvas API, cluster similar colors together, filter out background tones (near-white, near-black, and transparent pixels), and classify the dominant color by its hue value. The entire process takes milliseconds and happens entirely in your browser.",
    },

    // ── Contact page ──
    contact: {
      title: "Contact",
      intro: "Have feedback, questions, or suggestions? We'd love to hear from you.",
      emailUs: "Email us at",
      responseTime: "We typically respond within 24 hours.",
    },

    // ── Privacy page ──
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: June 2026",
      overview: "Overview",
      overviewDesc:
        "Color Archive is designed with your privacy as a core principle. All image processing happens entirely in your browser using the Canvas API. Your images are never uploaded to any server.",
      dataCollection: "Data Collection",
      dataCollectionDesc:
        "We do not collect, store, or transmit any personal information or images. The images you upload remain on your device and are processed locally. Any data stored in localStorage is solely for your convenience and never leaves your browser.",
      cookies: "Cookies",
      cookiesDesc:
        "Color Archive does not use cookies for tracking purposes. We may use essential cookies required for the basic functioning of the website.",
      thirdParty: "Third-Party Services",
      thirdPartyDesc:
        "We do not integrate any third-party analytics, advertising, or tracking services by default. If we enable Google Analytics in the future, we will update this policy and only collect anonymized, aggregated usage data to help us improve the service.",
      changes: "Changes to This Policy",
      changesDesc:
        'We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated "Last updated" date.',
      contact: "Contact",
      contactDesc: "If you have any questions about this privacy policy, please contact us at",
    },

    // ── Guide index page ──
    guideIndex: {
      title: "Guides",
      subtitle:
        "Learn about color theory, psychology, and practical tips for organizing and using color in your creative work.",
    },

    // ── Guide detail page ──
    guideDetail: {
      faq: "Frequently Asked Questions",
      related: "Related Guides",
    },

    // ── Colors index page ──
    colorsIndex: {
      title: "Colors",
      subtitle:
        "Explore each color family in detail — learn about color psychology, common design use cases, and view curated color swatches. Every color has a story.",
    },

    // ── Color detail page ──
    colorDetail: {
      title: "{label} Color Collection",
      hueRange: "Hue range: {hue}",
      palette: "Color Palette",
      psychology: "Color Psychology",
      useCases: "Common Use Cases",
      exploreOther: "Explore Other Colors",
    },
  },

  zh: {
    // ── Language switcher ──
    language: {
      en: "EN",
      zh: "中文",
    },

    // ── Nav / Header ──
    nav: {
      home: "首页",
      gallery: "画廊",
      colors: "色彩",
      guides: "指南",
      about: "关于",
      contact: "联系",
      privacy: "隐私政策",
    },
    header: {
      searchPlaceholder: "搜索十六进制色值… (#ff0000)",
      searchPlaceholderMobile: "#ff0000",
    },

    // ── Upload zone ──
    upload: {
      dropHere: "拖拽图片到此处，或点击选择",
      supportedFormats: "支持 JPG、PNG、WEBP 格式",
    },

    // ── Home page ──
    home: {
      heroTitle: "按颜色自动整理你的图片。",
      heroDesc:
        "拖入任意图片，Color Archive 会自动提取主色并归类到对应色系。你可以将其发布到社区画廊。所有处理都在浏览器本地完成。",
      processing: "正在处理图片...",
      imageCount: "{count} 张图片",
      imageCountPlural: "{count} 张图片",
      exportJson: "导出 JSON",
      clearAll: "清空所有",
      confirmClear: "确定要清空所有图片吗？",
      filterAll: "全部",
      getStarted: "上传一些图片开始使用",
      browseByColor: "按颜色浏览图片",
      feature1Title: "浏览器本地处理",
      feature1Desc:
        "你的图片不会离开设备。所有颜色分析均通过 Canvas API 在本地完成。无需上传，无需服务器，保护隐私。",
      feature2Title: "10 种色系分类",
      feature2Desc:
        "图片会自动归类为红色、橙色、黄色、绿色、青色、蓝色、紫色、粉色、棕色或灰度色系。支持手动调整分类。",
      feature3Title: "社区画廊",
      feature3Desc:
        "发布的图片会出现在公共画廊中，可按色系浏览。探索社区图库或贡献你自己的作品。",
    },

    // ── ImageCard ──
    imageCard: {
      deleteTitle: "删除",
      published: "已发布",
      publishing: "发布中...",
      publishToGallery: "发布到画廊",
    },

    // ── Gallery ──
    gallery: {
      title: "画廊",
      subtitle: "所有社区图片按颜色分类。上传你的图片加入其中。",
      loading: "加载图片中...",
      empty: "暂无图片。快来上传第一张！",
      end: "已经到底了——欢迎回来查看新上传的图片",
    },

    // ── Collection ──
    collection: {
      title: "{label} 合集",
      subtitle: "浏览社区提交的 {label} 色系图片。",
      loading: "加载中...",
      empty: "暂无 {label} 色系图片。上传一张来开启合集吧！",
      end: "已经到底了",
    },

    // ── Photo Detail ──
    photoDetail: {
      gallery: "画廊",
      details: "图片详情",
      dominantColor: "主色",
      colorFamily: "色系",
      uploaded: "上传时间",
      moreIn: "更多 {label} 色系图片",
    },

    // ── Search ──
    search: {
      title: "搜索结果",
      subtitle: "匹配颜色 {query} 的图片",
      searching: "搜索中...",
      noResults: '未找到颜色 "{query}" 的图片',
      trySearch: "尝试搜索十六进制色值，例如",
      orBrowse: "或浏览",
      allPhotos: "所有图片",
    },

    // ── CommunityStats ──
    communityStats: {
      title: "社区数据",
      viewGallery: "查看画廊 →",
      totalPhotos: "图片总数",
      activeColors: "活跃色系",
    },

    // ── LatestUploads ──
    latestUploads: {
      title: "最新上传",
      viewAll: "查看全部 →",
    },

    // ── Footer ──
    footer: {
      pages: "页面",
      colors: "色彩",
      company: "关于",
      home: "首页",
      privacyPolicy: "隐私政策",
      description:
        "Color Archive 帮助设计师、艺术家和创作者按颜色整理图片。所有处理均在浏览器本地完成。",
    },

    // ── Color families ──
    colorFamilies: {
      red: "红色",
      orange: "橙色",
      yellow: "黄色",
      green: "绿色",
      cyan: "青色",
      blue: "蓝色",
      purple: "紫色",
      pink: "粉色",
      brown: "棕色",
      grayscale: "灰度",
      uncategorized: "未分类",
    },

    // ── About page ──
    about: {
      title: "关于",
      whatIs: "什么是 Color Archive？",
      whatIsDesc:
        "Color Archive 是一款免费的浏览器端工具，能够自动分析图片并按主色系归类。上传任意图片，我们的颜色分析引擎会提取最突出的颜色，将其归类为十种色系之一（红色、橙色、黄色、绿色、青色、蓝色、紫色、粉色、棕色或灰度），并以简洁的灵感板风格展示你的收藏。",
      whyBuilt: "为什么我们打造它",
      whyBuiltDesc:
        "作为设计师和创作者，我们发现按颜色整理图片是最直观的浏览方式之一——但大多数工具要么需要上传到服务器，要么根本不存在这样的功能。我们打造 Color Archive 来解决这个问题：一款完全在浏览器中运行、尊重隐私、不打扰你创作流的工具。",
      privacy: "隐私优先",
      privacyDesc:
        "Color Archive 使用浏览器的 Canvas API 在本地处理所有图片。你的图片永远不会上传到任何服务器——它们不会离开你的电脑。我们不收集、不存储、不分享你的图片或任何个人信息。了解更多，请查看我们的",
      howWorks: "工作原理",
      howWorksDesc:
        "当你上传图片时，我们会将其压缩到较小的尺寸以提高性能，使用 Canvas API 采样像素，将相似颜色聚类，过滤掉背景色调（近白色、近黑色和透明像素），并根据色相值对主色进行分类。整个过程只需毫秒级时间，且完全在浏览器中完成。",
    },

    // ── Contact page ──
    contact: {
      title: "联系",
      intro: "有反馈、问题或建议？我们很乐意听取你的意见。",
      emailUs: "发送邮件至",
      responseTime: "我们通常会在 24 小时内回复。",
    },

    // ── Privacy page ──
    privacy: {
      title: "隐私政策",
      lastUpdated: "最后更新：2026 年 6 月",
      overview: "概述",
      overviewDesc:
        "Color Archive 以隐私为核心设计理念。所有图片处理完全在你的浏览器中使用 Canvas API 完成。你的图片永远不会上传到任何服务器。",
      dataCollection: "数据收集",
      dataCollectionDesc:
        "我们不收集、不存储、不传输任何个人信息或图片。你上传的图片保留在你的设备上并在本地处理。存储在 localStorage 中的数据仅为了你的便利，永远不会离开你的浏览器。",
      cookies: "Cookie",
      cookiesDesc:
        "Color Archive 不使用 Cookie 进行追踪。我们可能会使用网站基本运行所需的核心 Cookie。",
      thirdParty: "第三方服务",
      thirdPartyDesc:
        "我们默认不集成任何第三方分析、广告或追踪服务。如果未来启用 Google Analytics，我们将更新此政策，并仅收集匿名化的聚合使用数据以帮助我们改进服务。",
      changes: "政策变更",
      changesDesc:
        '我们可能会不时更新本隐私政策。任何变更将在此页面反映，并附上更新的"最后更新"日期。',
      contact: "联系",
      contactDesc: "如果你对本隐私政策有任何疑问，请通过以下邮箱联系我们：",
    },

    // ── Guide index ──
    guideIndex: {
      title: "指南",
      subtitle: "学习色彩理论、色彩心理学，以及在使用颜色进行创作时组织和运用的实用技巧。",
    },

    // ── Guide detail ──
    guideDetail: {
      faq: "常见问题",
      related: "相关指南",
    },

    // ── Colors index ──
    colorsIndex: {
      title: "色彩",
      subtitle: "详细了解每种色系——学习色彩心理学、常见设计应用场景，并查看精选配色样本。每种颜色都有其故事。",
    },

    // ── Color detail ──
    colorDetail: {
      title: "{label} 色系合集",
      hueRange: "色相范围：{hue}",
      palette: "色板",
      psychology: "色彩心理学",
      useCases: "常见用途",
      exploreOther: "探索其他色彩",
    },
  },
} as const;