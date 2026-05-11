import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TEMPLATES, FONTS } from "@/components/wedding/wedding-shared";
import { WeddingData, WEDDING_DEFAULTS, mergeWithDefaults } from "./wedding-defaults";

export type { WeddingData };

type Template = typeof TEMPLATES[number];
type Font = typeof FONTS[number];

const GET_URL = "https://functions.poehali.dev/cf831fbe-7593-4252-b588-6e67d1d9e3f5";
const SAVE_URL = "https://functions.poehali.dev/a20d2510-dbb5-48dd-9faf-c45e0a14bc04";

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
  const [data, setDataState] = useState<WeddingData>(WEDDING_DEFAULTS);
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