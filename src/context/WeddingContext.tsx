import { createContext, useContext, useState, ReactNode } from "react";
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
  venueRegion: string;
  inviteText: string;
  tmplId: string;
  fontId: string;
  dressCode: string;
  dressCodeColors: string[];
  contactGroom: string;
  contactBride: string;
  contactHost: string;
  contactEmail: string;
  timelineTitles: string[];
  timelineTexts: string[];
  timelineYears: string[];
  galleryPhotos: string[];
  audioUrl: string;
  audioName: string;
  // Texts
  heroTagline: string;
  heroBtn: string;
  storyTitle: string;
  storySub: string;
  detailsTitle: string;
  detailsSub: string;
  programLines: string[];
  rsvpDeadline: string;
  mapCarTitle: string;
  mapCarText: string;
  mapTrainTitle: string;
  mapTrainText: string;
  mapBusTitle: string;
  mapBusText: string;
  footerTitle: string;
  footerSub: string;
  mapLat: string;
  mapLng: string;
}

const DEFAULTS: WeddingData = {
  groomName: "Александр",
  brideName: "Мария",
  weddingDate: "2026-09-12T14:00:00",
  weddingTime: "14:00",
  venueName: "Усадьба «Белые Берёзы»",
  venueAddress: "Рублёво-Успенское ш., 42",
  venueRegion: "Московская область",
  inviteText: "Дорогой гость,\n\nМы с радостью приглашаем вас разделить с нами этот особенный день.",
  tmplId: "classic",
  fontId: "cormorant",
  dressCode: "Торжественный. Пожалуйста, воздержитесь от белого. Приветствуются пастельные, нежные оттенки.",
  dressCodeColors: ["#FAF7F2", "#E8C4B0", "#C9897A", "#B8976A", "#7A9B6E", "#9B8878"],
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
  galleryPhotos: [],
  audioUrl: "",
  audioName: "",
  heroTagline: "Регистрация на торжество",
  heroBtn: "Подтвердить присутствие",
  storyTitle: "Наша история",
  storySub: "Как всё началось",
  detailsTitle: "Детали события",
  detailsSub: "Что нужно знать",
  programLines: ["14:00 — Церемония", "15:30 — Банкет", "23:00 — Окончание"],
  rsvpDeadline: "Просим ответить до 1 августа 2026",
  mapCarTitle: "На автомобиле",
  mapCarText: "По Рублёво-Успенскому шоссе, 42 км от МКАД. Бесплатная парковка.",
  mapTrainTitle: "На электричке",
  mapTrainText: "С Белорусского вокзала до ст. Усово, далее такси 5 минут.",
  mapBusTitle: "Трансфер",
  mapBusText: "Автобус от м. Строгино в 13:00. Бесплатно для гостей.",
  footerTitle: "До встречи на нашем торжестве",
  footerSub: "С любовью",
  mapLat: "55.7494",
  mapLng: "37.2219",
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
      if (!saved) return DEFAULTS;
      const parsed = JSON.parse(saved);
      // Ensure array fields are always arrays (backward compat with old localStorage)
      return {
        ...DEFAULTS,
        ...parsed,
        galleryPhotos: Array.isArray(parsed.galleryPhotos) ? parsed.galleryPhotos : [],
        dressCodeColors: Array.isArray(parsed.dressCodeColors) ? parsed.dressCodeColors : DEFAULTS.dressCodeColors,
        programLines: Array.isArray(parsed.programLines) ? parsed.programLines : DEFAULTS.programLines,
        timelineTitles: Array.isArray(parsed.timelineTitles) ? parsed.timelineTitles : DEFAULTS.timelineTitles,
        timelineTexts: Array.isArray(parsed.timelineTexts) ? parsed.timelineTexts : DEFAULTS.timelineTexts,
        timelineYears: Array.isArray(parsed.timelineYears) ? parsed.timelineYears : DEFAULTS.timelineYears,
        audioUrl: parsed.audioUrl ?? "",
        audioName: parsed.audioName ?? "",
      };
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