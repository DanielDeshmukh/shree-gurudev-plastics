export interface FestivalConfig {
  enabled: boolean;
  name: string;
  slug: string;
  discountPct: number;
  bannerMessage: string;
  endDate: string | null;
  theme: FestivalTheme;
}

export interface FestivalTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  gradient: string;
  icon: string;
}

export const FESTIVALS: Record<string, FestivalConfig> = {
  ganesh_chaturthi: {
    enabled: false,
    name: "Ganesh Chaturthi",
    slug: "ganesh_chaturthi",
    discountPct: 10,
    bannerMessage: "Ganpati Bappa Morya! Special festive offers on all products!",
    endDate: null,
    theme: {
      primary: "#ff8f00",
      primaryLight: "#fff8e1",
      primaryDark: "#e65100",
      accent: "#c62828",
      gradient: "linear-gradient(135deg, #ff8f00, #ff6f00, #e65100)",
      icon: "modak",
    },
  },
  diwali: {
    enabled: false,
    name: "Diwali",
    slug: "diwali",
    discountPct: 15,
    bannerMessage: "Happy Diwali! Light up your savings with festive deals!",
    endDate: null,
    theme: {
      primary: "#ff6f00",
      primaryLight: "#fff3e0",
      primaryDark: "#bf360c",
      accent: "#ffd600",
      gradient: "linear-gradient(135deg, #ff6f00, #ffab00, #ffd600)",
      icon: "diya",
    },
  },
  holi: {
    enabled: false,
    name: "Holi",
    slug: "holi",
    discountPct: 10,
    bannerMessage: "Happy Holi! Add colors of savings to your business!",
    endDate: null,
    theme: {
      primary: "#e91e63",
      primaryLight: "#fce4ec",
      primaryDark: "#880e4f",
      accent: "#7c4dff",
      gradient: "linear-gradient(135deg, #e91e63, #9c27b0, #7c4dff)",
      icon: "colors",
    },
  },
  navratri: {
    enabled: false,
    name: "Navratri",
    slug: "navratri",
    discountPct: 10,
    bannerMessage: "Navratri Special! 9 nights of great deals!",
    endDate: null,
    theme: {
      primary: "#d32f2f",
      primaryLight: "#ffebee",
      primaryDark: "#b71c1c",
      accent: "#ffd600",
      gradient: "linear-gradient(135deg, #d32f2f, #ff6f00, #ffd600)",
      icon: "dandiya",
    },
  },
  christmas: {
    enabled: false,
    name: "Christmas",
    slug: "christmas",
    discountPct: 15,
    bannerMessage: "Merry Christmas! Holiday season deals for your business!",
    endDate: null,
    theme: {
      primary: "#c62828",
      primaryLight: "#ffebee",
      primaryDark: "#8e0000",
      accent: "#2e7d32",
      gradient: "linear-gradient(135deg, #c62828, #2e7d32)",
      icon: "tree",
    },
  },
  new_year: {
    enabled: false,
    name: "New Year",
    slug: "new_year",
    discountPct: 10,
    bannerMessage: "Happy New Year! Start fresh with wholesale deals!",
    endDate: null,
    theme: {
      primary: "#1565c0",
      primaryLight: "#e3f2fd",
      primaryDark: "#0d47a1",
      accent: "#ffd600",
      gradient: "linear-gradient(135deg, #1565c0, #7c4dff, #ffd600)",
      icon: "star",
    },
  },
};

export function getActiveFestival(): FestivalConfig | null {
  for (const festival of Object.values(FESTIVALS)) {
    if (festival.enabled) {
      if (festival.endDate && new Date(festival.endDate) < new Date()) {
        return null;
      }
      return festival;
    }
  }
  return null;
}

export function getFestivalBySlug(slug: string): FestivalConfig | null {
  return FESTIVALS[slug] || null;
}

export function getFestivalTheme(slug: string): FestivalTheme {
  return FESTIVALS[slug]?.theme || FESTIVALS.ganesh_chaturthi.theme;
}
