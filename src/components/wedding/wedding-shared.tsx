import { useState, useEffect, useRef } from "react";

export const HERO_IMAGE =
  "https://cdn.poehali.dev/projects/bbfcdec2-563b-424a-b59e-2b4a8785b859/files/3d50b3d3-f5bd-4172-b326-544619e05ab5.jpg";

export const HERO_IMAGE_MINIMAL =
  "https://cdn.poehali.dev/projects/bbfcdec2-563b-424a-b59e-2b4a8785b859/files/6ccf6cad-c0e0-49c0-9b64-fd5429916760.jpg";

export const FONTS = [
  { id: "cormorant", name: "Cormorant", cls: "font-cormorant" },
  { id: "playfair", name: "Playfair", cls: "font-playfair" },
  { id: "lora", name: "Lora", cls: "font-lora" },
  { id: "montserrat", name: "Montserrat", cls: "font-montserrat" },
  { id: "caveat", name: "Caveat", cls: "font-caveat" },
];

export const TEMPLATES = [
  { id: "classic", name: "Классика", bg: "bg-white", border: "border-[#B8976A]", accent: "text-[#B8976A]", text: "text-[#3D2B1F]", heroImage: HERO_IMAGE, overlayClass: "bg-[#3D2B1F]/45" },
  { id: "minimal", name: "Минимал", bg: "bg-[#FAF7F2]", border: "border-[#4A4035]", accent: "text-[#4A4035]", text: "text-[#4A4035]", heroImage: HERO_IMAGE_MINIMAL, overlayClass: "bg-black/30" },
  { id: "romantic", name: "Романтик", bg: "bg-[#FDF0F0]", border: "border-[#C9897A]", accent: "text-[#C9897A]", text: "text-[#3D2B1F]", heroImage: HERO_IMAGE, overlayClass: "bg-[#3D2B1F]/45" },
  { id: "nature", name: "Природа", bg: "bg-[#F0F4EE]", border: "border-[#7A9B6E]", accent: "text-[#7A9B6E]", text: "text-[#2D4A25]", heroImage: HERO_IMAGE, overlayClass: "bg-[#2D4A25]/45" },
];

export const SURVEYS = [
  { id: 1, q: "Какой вариант меню вы предпочитаете?", opts: ["Мясное блюдо", "Рыбное блюдо", "Вегетарианское"] },
  { id: 2, q: "Вы придёте с партнёром?", opts: ["Да, с партнёром", "Буду один / одна"] },
  { id: 3, q: "Пожелания к DJ?", opts: ["Поп-музыка", "Классика", "Живая музыка", "Всё равно"] },
];

export const TIMELINE = [
  { year: "2019", title: "Первая встреча", text: "Случайное знакомство на выставке современного искусства изменило всё." },
  { year: "2020", title: "Первое путешествие", text: "Вместе встретили рассвет над морем и поняли — хотим путешествовать вечно." },
  { year: "2022", title: "Предложение", text: "Среди звёзд Тосканы прозвучало главное слово — да." },
  { year: "2026", title: "Свадьба", text: "И вот этот день настал. Мы рады разделить его с вами." },
];

export const TRACKS = [
  { title: "Ed Sheeran — Perfect", sub: "Первый танец" },
  { title: "Christina Perri — A Thousand Years", sub: "Вальс" },
  { title: "Elvis — Can't Help Falling in Love", sub: "Романтика" },
];

export const NAV_ITEMS = [
  { id: "hero", label: "Главная" },
  { id: "story", label: "История" },
  { id: "details", label: "Детали" },
  { id: "rsvp", label: "Регистрация" },
  { id: "map", label: "Карта" },
  { id: "music", label: "Музыка" },
  { id: "gallery", label: "Галерея" },
  { id: "contacts", label: "Контакты" },
];

export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

export function Fade({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, vis } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="text-center mb-14">
      <p className="text-[10px] tracking-[0.5em] text-[#B8976A] font-montserrat uppercase mb-3">{sub}</p>
      <h2 className="font-cormorant text-4xl md:text-5xl font-light text-[#3D2B1F] mb-5 leading-tight">{title}</h2>
      <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mx-auto" />
    </div>
  );
}

export function Petals() {
  const items = ["🌸", "✿", "🌺", "❀", "🌷", "✾", "🌸", "✿"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {items.map((p, i) => (
        <span
          key={i}
          className="fixed text-sm opacity-50"
          style={{
            left: `${8 + i * 11}%`,
            animation: `petal-fall ${5 + (i % 3)}s ease-in ${i * 0.9}s infinite`,
          }}
        >{p}</span>
      ))}
    </div>
  );
}