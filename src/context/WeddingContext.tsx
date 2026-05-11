import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TEMPLATES, FONTS } from "@/components/wedding/wedding-shared";

type Template = typeof TEMPLATES[number];
type Font = typeof FONTS[number];

export interface WeddingData {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  inviteText: string;
  tmplId: string;
  fontId: string;
  dressCode: string;
  contactGroom: string;
  contactBride: string;
  contactHost: string;
  contactEmail: string;
  timelineTitles: string[];
  timelineTexts: string[];
  timelineYears: string[];
}

const DEFAULTS: WeddingData = {
  groomName: "Александр",
  brideName: "Мария",
  weddingDate: "2026-09-12T14:00:00",
  weddingTime: "14:00",
  venueName: "Усадьба «Белые Берёзы»",
  venueAddress: "Рублёво-Успенское ш., 42",
  inviteText: "Дорогой гость,\n\nМы с радостью приглашаем вас разделить с нами этот особенный день.",
  tmplId: "classic",
  fontId: "cormorant",
  dressCode: "Торжественный. Пожалуйста, воздержитесь от белого. Приветствуются пастельные, нежные оттенки.",
  contactGroom: "+7 (999) 123-45-67",
  contactBride: "+7 (999) 765-43-21",
  contactHost: "+7 (916) 555-00-11",
  contactEmail: "wedding@example.com",
  timelineTitles: ["Первая встреча", "Первое путешествие", "Предложение", "Свадьба"],
  timelineTexts: [
    "Случайное знакомство на выставке современного искусства изменило всё.",
    "Вместе встретили рассвет над морем и поняли — хотим путешествовать вечно.",
    "Среди звёзд Тосканы прозвучало главное слово — да.",
    "И вот этот день настал. Мы рады разделить его с вами.",
  ],
  timelineYears: ["2019", "2020", "2022", "2026"],
};

const STORAGE_KEY = "wedding_site_data";

interface WeddingContextValue {
  data: WeddingData;
  setData: (d: WeddingData) => void;
  tmpl: Template;
  font: Font;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<WeddingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const setData = (d: WeddingData) => {
    setDataState(d);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  };

  const tmpl = TEMPLATES.find((t) => t.id === data.tmplId) ?? TEMPLATES[0];
  const font = FONTS.find((f) => f.id === data.fontId) ?? FONTS[0];

  return (
    <WeddingContext.Provider value={{ data, setData, tmpl, font }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used inside WeddingProvider");
  return ctx;
}
