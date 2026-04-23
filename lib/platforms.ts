export type PlatformItem = {
    slug: string;
    title: string;
    shortTitle?: string;
    description?: string;
    emoji: string;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
  };
  
  export const PLATFORM_DEFINITIONS: PlatformItem[] = [
    {
      slug: "instagram",
      title: "Instagram",
      emoji: "📸",
      description: "Takipçi, beğeni, izlenme, yorum ve daha fazlası",
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: "tiktok",
      title: "TikTok",
      emoji: "🎵",
      description: "Takipçi, beğeni, izlenme ve etkileşim hizmetleri",
      isFeatured: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: "youtube",
      title: "YouTube",
      emoji: "▶️",
      description: "Abone, izlenme, beğeni ve yorum hizmetleri",
      isFeatured: true,
      isActive: true,
      sortOrder: 3,
    },
    {
      slug: "telegram",
      title: "Telegram",
      emoji: "✈️",
      description: "Üye, görüntüleme, reaksiyon ve kanal destek hizmetleri",
      isFeatured: true,
      isActive: true,
      sortOrder: 4,
    },
    {
      slug: "spotify",
      title: "Spotify",
      emoji: "🎧",
      description: "Dinlenme, takipçi ve müzik büyütme hizmetleri",
      isFeatured: true,
      isActive: true,
      sortOrder: 5,
    },
    {
      slug: "facebook",
      title: "Facebook",
      emoji: "📘",
      description: "Beğeni, takipçi, görüntülenme ve etkileşim hizmetleri",
      isFeatured: true,
      isActive: true,
      sortOrder: 6,
    },
    {
      slug: "x",
      title: "X / Twitter",
      shortTitle: "X",
      emoji: "𝕏",
      description: "Takipçi, beğeni, görüntülenme ve retweet hizmetleri",
      isFeatured: true,
      isActive: true,
      sortOrder: 7,
    },
    {
      slug: "twitch",
      title: "Twitch",
      emoji: "🟣",
      description: "Takipçi, görüntülenme ve yayın etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 8,
    },
    {
      slug: "kick",
      title: "Kick",
      emoji: "🟢",
      description: "Takipçi, görüntülenme ve yayın destek hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 9,
    },
    {
      slug: "discord",
      title: "Discord",
      emoji: "💬",
      description: "Üye ve topluluk büyütme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 10,
    },
    {
      slug: "snapchat",
      title: "Snapchat",
      emoji: "👻",
      description: "Görüntülenme ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 11,
    },
    {
      slug: "pinterest",
      title: "Pinterest",
      emoji: "📌",
      description: "Takipçi ve görüntülenme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 12,
    },
    {
      slug: "linkedin",
      title: "LinkedIn",
      emoji: "💼",
      description: "Takipçi ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 13,
    },
    {
      slug: "reddit",
      title: "Reddit",
      emoji: "👽",
      description: "Upvote, görüntülenme ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 14,
    },
    {
      slug: "threads",
      title: "Threads",
      emoji: "🧵",
      description: "Takipçi, beğeni ve görüntülenme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 15,
    },
    {
      slug: "apple-music",
      title: "Apple Music",
      emoji: "🍎",
      description: "Dinlenme ve müzik büyütme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 16,
    },
    {
      slug: "soundcloud",
      title: "SoundCloud",
      emoji: "☁️",
      description: "Dinlenme, beğeni ve takipçi hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 17,
    },
    {
      slug: "audiomack",
      title: "Audiomack",
      emoji: "🎶",
      description: "Dinlenme ve takipçi hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 18,
    },
    {
      slug: "deezer",
      title: "Deezer",
      emoji: "🎼",
      description: "Dinlenme ve müzik büyütme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 19,
    },
    {
      slug: "shazam",
      title: "Shazam",
      emoji: "🎤",
      description: "Müzik keşif ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 20,
    },
    {
      slug: "boomplay",
      title: "Boomplay",
      emoji: "🔊",
      description: "Dinlenme ve müzik platformu büyütme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 21,
    },
    {
      slug: "steam",
      title: "Steam",
      emoji: "🎮",
      description: "Topluluk ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 22,
    },
    {
      slug: "xbox",
      title: "Xbox",
      emoji: "🕹️",
      description: "Topluluk ve profil destek hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 23,
    },
    {
      slug: "vk",
      title: "VK",
      emoji: "🔵",
      description: "Takipçi, beğeni ve görüntülenme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 24,
    },
    {
      slug: "rutube",
      title: "Rutube",
      emoji: "📺",
      description: "İzlenme ve kanal büyütme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 25,
    },
    {
      slug: "ok-ru",
      title: "OK.ru",
      emoji: "🟠",
      description: "Takipçi ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 26,
    },
    {
      slug: "dzen",
      title: "Dzen",
      emoji: "📰",
      description: "İzlenme ve kanal destek hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 27,
    },
    {
      slug: "github",
      title: "GitHub",
      emoji: "🐙",
      description: "Repo ve profil görünürlüğü destek hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 28,
    },
    {
      slug: "tumblr",
      title: "Tumblr",
      emoji: "📝",
      description: "Takipçi ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 29,
    },
    {
      slug: "bluesky",
      title: "Bluesky",
      emoji: "🌤️",
      description: "Takipçi ve etkileşim hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 30,
    },
    {
      slug: "vimeo",
      title: "Vimeo",
      emoji: "🎬",
      description: "İzlenme ve video büyütme hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 31,
    },
    {
      slug: "google-review",
      title: "Google Review",
      emoji: "⭐",
      description: "Yorum ve değerlendirme destek hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 32,
    },
    {
      slug: "google-maps",
      title: "Google Maps",
      emoji: "📍",
      description: "Harita yorum ve görünürlük hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 33,
    },
    {
      slug: "whatsapp",
      title: "WhatsApp",
      emoji: "🟢",
      description: "Kanal ve topluluk destek hizmetleri",
      isFeatured: false,
      isActive: true,
      sortOrder: 34,
    },
  ];
  
  export function getAllPlatforms() {
    return PLATFORM_DEFINITIONS
      .filter((item) => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  export function getFeaturedPlatforms() {
    return PLATFORM_DEFINITIONS
      .filter((item) => item.isActive && item.isFeatured)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  export function getSecondaryPlatforms() {
    return PLATFORM_DEFINITIONS
      .filter((item) => item.isActive && !item.isFeatured)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  export function getPlatformBySlug(slug: string) {
    return PLATFORM_DEFINITIONS.find((item) => item.slug === slug);
  }