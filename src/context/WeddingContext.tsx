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

export const DEFAULTS: WeddingData = {
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

const GET_URL = "https://functions.poehali.dev/cf831fbe-7593-4252-b588-6e67d1d9e3f5";
const SAVE_URL = "https://functions.poehali.dev/a20d2510-dbb5-48dd-9faf-c45e0a14bc04";

function mergeWithDefaults(parsed: Partial<WeddingData>): WeddingData {
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
}

interface WeddingContextValue {
  data: WeddingData;
  setData: (d: WeddingData) => void;
  saveData: (d: WeddingData, adminPassword: string) => Promise<void>;
  tmpl: Template;
  font: Font;
  loading: boolean;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<WeddingData>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GET_URL)
      .then((r) => r.json())
      .then((json) => {
        if (json && !json.error) {
          setDataState(mergeWithDefaults(json));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setData = (d: WeddingData) => {
    setDataState(d);
  };

  const saveData = async (d: WeddingData, adminPassword: string): Promise<void> => {
    setDataState(d);
    const res = await fetch(SAVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': adminPassword,
      },
      body: JSON.stringify(d),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'save_failed');
    }
  };

  const tmpl = TEMPLATES.find((t) => t.id === data.tmplId) ?? TEMPLATES[0];
  const font = FONTS.find((f) => f.id === data.fontId) ?? FONTS[0];

  return (
    <WeddingContext.Provider value={{ data, setData, saveData, tmpl, font, loading }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used inside WeddingProvider");
  return ctx;
}