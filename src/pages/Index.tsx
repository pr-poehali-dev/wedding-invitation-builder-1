import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE =
  "https://cdn.poehali.dev/projects/bbfcdec2-563b-424a-b59e-2b4a8785b859/files/3d50b3d3-f5bd-4172-b326-544619e05ab5.jpg";

const FONTS = [
  { id: "cormorant", name: "Cormorant", cls: "font-cormorant" },
  { id: "playfair", name: "Playfair", cls: "font-playfair" },
  { id: "lora", name: "Lora", cls: "font-lora" },
  { id: "montserrat", name: "Montserrat", cls: "font-montserrat" },
  { id: "caveat", name: "Caveat", cls: "font-caveat" },
];

const TEMPLATES = [
  { id: "classic", name: "Классика", bg: "bg-white", border: "border-[#B8976A]", accent: "text-[#B8976A]", text: "text-[#3D2B1F]" },
  { id: "minimal", name: "Минимал", bg: "bg-[#FAF7F2]", border: "border-[#4A4035]", accent: "text-[#4A4035]", text: "text-[#4A4035]" },
  { id: "romantic", name: "Романтик", bg: "bg-[#FDF0F0]", border: "border-[#C9897A]", accent: "text-[#C9897A]", text: "text-[#3D2B1F]" },
  { id: "nature", name: "Природа", bg: "bg-[#F0F4EE]", border: "border-[#7A9B6E]", accent: "text-[#7A9B6E]", text: "text-[#2D4A25]" },
];

const SURVEYS = [
  { id: 1, q: "Какой вариант меню вы предпочитаете?", opts: ["Мясное блюдо", "Рыбное блюдо", "Вегетарианское"] },
  { id: 2, q: "Вы придёте с партнёром?", opts: ["Да, с партнёром", "Буду один / одна"] },
  { id: 3, q: "Пожелания к DJ?", opts: ["Поп-музыка", "Классика", "Живая музыка", "Всё равно"] },
];

const TIMELINE = [
  { year: "2019", title: "Первая встреча", text: "Случайное знакомство на выставке современного искусства изменило всё." },
  { year: "2020", title: "Первое путешествие", text: "Вместе встретили рассвет над морем и поняли — хотим путешествовать вечно." },
  { year: "2022", title: "Предложение", text: "Среди звёзд Тосканы прозвучало главное слово — да." },
  { year: "2026", title: "Свадьба", text: "И вот этот день настал. Мы рады разделить его с вами." },
];

const TRACKS = [
  { title: "Ed Sheeran — Perfect", sub: "Первый танец" },
  { title: "Christina Perri — A Thousand Years", sub: "Вальс" },
  { title: "Elvis — Can't Help Falling in Love", sub: "Романтика" },
];

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

function Fade({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
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

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="text-center mb-14">
      <p className="text-[10px] tracking-[0.5em] text-[#B8976A] font-montserrat uppercase mb-3">{sub}</p>
      <h2 className="font-cormorant text-4xl md:text-5xl font-light text-[#3D2B1F] mb-5 leading-tight">{title}</h2>
      <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mx-auto" />
    </div>
  );
}

function Petals() {
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

export default function Index() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("hero");
  const [tmpl, setTmpl] = useState(TEMPLATES[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [inviteText, setInviteText] = useState("Дорогой гость,\n\nМы с радостью приглашаем вас разделить с нами этот особенный день.");
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"" | "yes" | "no">("");
  const [rsvpDone, setRsvpDone] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [surveyDone, setSurveyDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const wedding = new Date("2026-09-12T14:00:00");

  useEffect(() => {
    const t = setInterval(() => {
      const diff = wedding.getTime() - Date.now();
      if (diff > 0) setCd({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const navItems = [
    { id: "hero", label: "Главная" }, { id: "story", label: "История" },
    { id: "details", label: "Детали" }, { id: "constructor", label: "Конструктор" },
    { id: "rsvp", label: "RSVP" }, { id: "survey", label: "Опросы" },
    { id: "map", label: "Карта" }, { id: "music", label: "Музыка" },
    { id: "gallery", label: "Галерея" }, { id: "contacts", label: "Контакты" },
  ];

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(id); setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative overflow-x-hidden">
      <Petals />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-sm border-b border-[#E8C4B0]/30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => go("hero")} className="font-cormorant text-xl tracking-widest text-[#3D2B1F] font-light">
            А & М
          </button>
          <button className="md:hidden" onClick={() => setNavOpen(!navOpen)}>
            <Icon name={navOpen ? "X" : "Menu"} size={20} className="text-[#4A4035]" />
          </button>
          <div className="hidden md:flex items-center gap-5">
            {navItems.map((n) => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`nav-link text-[10px] tracking-[0.18em] font-montserrat uppercase transition-colors ${activeNav === n.id ? "text-[#B8976A]" : "text-[#9B8878] hover:text-[#3D2B1F]"}`}>
                {n.label}
              </button>
            ))}
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden bg-[#F5F0E8] border-t border-[#E8C4B0]/30 py-3">
            {navItems.map((n) => (
              <button key={n.id} onClick={() => go(n.id)}
                className="block w-full text-left px-6 py-2.5 text-sm font-montserrat text-[#4A4035] hover:text-[#B8976A] transition-colors">
                {n.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#3D2B1F]/45" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p className="text-[10px] tracking-[0.7em] text-white/65 font-montserrat uppercase mb-6 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            Вы приглашены
          </p>
          <h1 className="font-cormorant text-6xl md:text-8xl font-light text-white leading-none mb-2 animate-fade-up" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
            Александр
          </h1>
          <p className="font-cormorant text-4xl md:text-5xl italic text-[#E8C4B0] mb-2 animate-fade-up" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
            &amp;
          </p>
          <h1 className="font-cormorant text-6xl md:text-8xl font-light text-white leading-none animate-fade-up" style={{ animationDelay: "1s", animationFillMode: "both" }}>
            Мария
          </h1>
          <div className="animate-fade-up" style={{ animationDelay: "1.2s", animationFillMode: "both" }}>
            <div className="w-48 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto my-7" />
            <p className="font-cormorant text-xl text-white/80 italic tracking-wider">12 сентября 2026 года</p>
            <p className="text-[10px] tracking-[0.35em] text-white/55 font-montserrat uppercase mt-1">Усадьба «Белые Берёзы» · Москва</p>
          </div>
          {/* Countdown */}
          <div className="mt-10 grid grid-cols-4 gap-3 max-w-xs mx-auto animate-fade-up" style={{ animationDelay: "1.4s", animationFillMode: "both" }}>
            {[{ v: cd.d, l: "дней" }, { v: cd.h, l: "часов" }, { v: cd.m, l: "минут" }, { v: cd.s, l: "секунд" }].map((c) => (
              <div key={c.l} className="text-center">
                <div className="font-cormorant text-3xl font-light text-white tabular-nums">{String(c.v).padStart(2, "0")}</div>
                <div className="text-[9px] tracking-widest text-white/45 font-montserrat uppercase">{c.l}</div>
              </div>
            ))}
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "1.6s", animationFillMode: "both" }}>
            <button onClick={() => go("rsvp")}
              className="mt-10 px-9 py-3.5 border border-white/45 text-white text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-white hover:text-[#3D2B1F] transition-all duration-300">
              Подтвердить присутствие
            </button>
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/35 animate-bounce">
          <Icon name="ChevronDown" size={20} />
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="py-24 px-6 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto">
          <Fade><SectionTitle title="Наша история" sub="Как всё началось" /></Fade>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#B8976A]/40 to-transparent hidden md:block" />
            {TIMELINE.map((item, i) => (
              <Fade key={item.year} delay={i * 120}>
                <div className={`flex items-start gap-8 mb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <span className="text-[10px] tracking-[0.35em] text-[#B8976A] font-montserrat uppercase">{item.year}</span>
                    <h3 className="font-cormorant text-2xl font-medium text-[#3D2B1F] mt-1 mb-2">{item.title}</h3>
                    <p className="text-sm text-[#9B8878] leading-relaxed font-montserrat">{item.text}</p>
                  </div>
                  <div className="hidden md:block w-3 h-3 rounded-full bg-[#B8976A] mt-2 shrink-0 relative z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section id="details" className="py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-5xl mx-auto">
          <Fade><SectionTitle title="Детали события" sub="Что нужно знать" /></Fade>
          <div className="grid md:grid-cols-3 gap-7">
            {[
              { icon: "Calendar", title: "Дата", lines: ["12 сентября 2026", "Суббота", "Начало в 14:00"] },
              { icon: "MapPin", title: "Место", lines: ["Усадьба «Белые Берёзы»", "Рублёво-Успенское ш., 42", "Московская область"] },
              { icon: "Clock", title: "Программа", lines: ["14:00 — Церемония", "15:30 — Банкет", "23:00 — Окончание"] },
            ].map((c, i) => (
              <Fade key={c.title} delay={i * 100}>
                <div className="bg-white border border-[#E8D5BE] p-8 text-center shadow-sm rounded-sm" style={{ boxShadow: "0 4px 40px rgba(61,43,31,0.06)" }}>
                  <div className="w-11 h-11 rounded-full bg-[#E8C4B0]/30 flex items-center justify-center mx-auto mb-4">
                    <Icon name={c.icon as "Calendar"} size={18} className="text-[#B8976A]" />
                  </div>
                  <h3 className="font-cormorant text-2xl font-medium text-[#3D2B1F] mb-3">{c.title}</h3>
                  <div className="w-10 h-px bg-[#B8976A]/50 mx-auto mb-4" />
                  {c.lines.map((l) => <p key={l} className="text-sm text-[#9B8878] font-montserrat leading-loose">{l}</p>)}
                </div>
              </Fade>
            ))}
          </div>
          <Fade delay={250}>
            <div className="mt-9 bg-white border border-[#E8D5BE] p-8 text-center max-w-xl mx-auto rounded-sm" style={{ boxShadow: "0 4px 40px rgba(61,43,31,0.06)" }}>
              <p className="text-[10px] tracking-[0.35em] text-[#B8976A] font-montserrat uppercase mb-2">Дресс-код</p>
              <h3 className="font-cormorant text-2xl font-medium text-[#3D2B1F] mb-3">Торжественный</h3>
              <p className="text-sm text-[#9B8878] font-montserrat leading-relaxed">
                Пожалуйста, воздержитесь от белого. Приветствуются пастельные, нежные оттенки.
              </p>
              <div className="flex gap-2 justify-center mt-5">
                {["#FAF7F2","#E8C4B0","#C9897A","#B8976A","#7A9B6E","#9B8878"].map(c => (
                  <div key={c} className="w-6 h-6 rounded-full border border-[#E8D5BE]" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* CONSTRUCTOR */}
      <section id="constructor" className="py-24 px-6 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto">
          <Fade><SectionTitle title="Конструктор приглашений" sub="Создайте своё" /></Fade>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Fade>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] tracking-[0.35em] text-[#B8976A] font-montserrat uppercase mb-4">Шаблон</p>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map((t) => (
                      <button key={t.id} onClick={() => setTmpl(t)}
                        className={`p-4 rounded-sm border-2 transition-all ${t.bg} ${tmpl.id === t.id ? "border-[#B8976A]" : "border-[#E8D5BE] hover:border-[#B8976A]/50"}`}>
                        <span className={`font-cormorant text-lg ${t.accent}`}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.35em] text-[#B8976A] font-montserrat uppercase mb-4">Шрифт</p>
                  <div className="flex flex-wrap gap-2">
                    {FONTS.map((f) => (
                      <button key={f.id} onClick={() => setFont(f)}
                        className={`px-4 py-2 border text-sm transition-all rounded-sm ${f.cls} ${font.id === f.id ? "border-[#B8976A] bg-[#B8976A]/10 text-[#3D2B1F]" : "border-[#E8D5BE] text-[#9B8878] hover:border-[#B8976A]"}`}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.35em] text-[#B8976A] font-montserrat uppercase mb-3">Текст</p>
                  <textarea value={inviteText} onChange={(e) => setInviteText(e.target.value)}
                    className="w-full h-28 p-4 border border-[#E8D5BE] bg-white/60 text-sm text-[#4A4035] font-montserrat resize-none focus:outline-none focus:border-[#B8976A] rounded-sm transition-colors" />
                </div>
                <button className="w-full py-3.5 bg-[#3D2B1F] text-[#FAF7F2] text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-[#4A4035] transition-colors rounded-sm">
                  Скачать приглашение
                </button>
              </div>
            </Fade>
            <Fade delay={200}>
              <div className="sticky top-20">
                <p className="text-[10px] tracking-[0.35em] text-[#9B8878] font-montserrat uppercase mb-4 text-center">Предпросмотр</p>
                <div className={`p-10 text-center border-2 rounded-sm ${tmpl.bg} ${tmpl.border}`} style={{ boxShadow: "0 8px 50px rgba(61,43,31,0.1)" }}>
                  <p className={`text-[9px] tracking-[0.5em] font-montserrat uppercase mb-3 ${tmpl.accent}`}>Вы приглашены</p>
                  <h2 className={`text-3xl font-light mb-2 ${font.cls} ${tmpl.text}`}>Александр & Мария</h2>
                  <p className={`text-xs tracking-wider font-montserrat mb-6 ${tmpl.accent}`}>12.09.2026 · Усадьба «Белые Берёзы»</p>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mx-auto mb-6" />
                  <p className={`text-sm leading-relaxed font-montserrat whitespace-pre-line ${tmpl.text} opacity-70`}>{inviteText}</p>
                  <p className="text-[#B8976A] mt-6 tracking-[0.4em]">✦ ✦ ✦</p>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-xl mx-auto">
          <Fade><SectionTitle title="RSVP" sub="Подтверждение присутствия" /></Fade>
          <Fade delay={100}>
            {rsvpDone ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-5">🌸</div>
                <h3 className="font-cormorant text-3xl text-[#3D2B1F] mb-3">
                  {rsvpStatus === "yes" ? "Спасибо! Ждём вас!" : "Жаль, что не сможете!"}
                </h3>
                <p className="text-sm text-[#9B8878] font-montserrat">
                  {rsvpStatus === "yes" ? `${rsvpName}, мы очень рады!` : `${rsvpName}, спасибо, что сообщили.`}
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (rsvpName && rsvpStatus) setRsvpDone(true); }}
                className="bg-white border border-[#E8D5BE] p-8 rounded-sm space-y-6" style={{ boxShadow: "0 4px 40px rgba(61,43,31,0.06)" }}>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-2">Ваше имя *</label>
                  <input type="text" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} required placeholder="Иванов Иван"
                    className="w-full px-4 py-3 border border-[#E8D5BE] bg-transparent text-sm text-[#4A4035] font-montserrat focus:outline-none focus:border-[#B8976A] rounded-sm transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-2">Email</label>
                  <input type="email" value={rsvpEmail} onChange={(e) => setRsvpEmail(e.target.value)} placeholder="ivan@example.com"
                    className="w-full px-4 py-3 border border-[#E8D5BE] bg-transparent text-sm text-[#4A4035] font-montserrat focus:outline-none focus:border-[#B8976A] rounded-sm transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-3">Вы придёте? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["yes", "no"].map((s) => (
                      <button key={s} type="button" onClick={() => setRsvpStatus(s as "yes" | "no")}
                        className={`py-3 border text-sm font-montserrat tracking-wider transition-all rounded-sm ${
                          rsvpStatus === s
                            ? s === "yes" ? "border-[#B8976A] bg-[#B8976A]/10 text-[#3D2B1F]" : "border-[#C9897A] bg-[#C9897A]/10 text-[#3D2B1F]"
                            : "border-[#E8D5BE] text-[#9B8878] hover:border-[#B8976A]"
                        }`}>
                        {s === "yes" ? "С радостью приду" : "Не смогу"}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-3.5 bg-[#3D2B1F] text-[#FAF7F2] text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-[#4A4035] transition-colors rounded-sm">
                  Отправить ответ
                </button>
                <p className="text-xs text-[#9B8878] font-montserrat text-center">Просим ответить до 1 августа 2026</p>
              </form>
            )}
          </Fade>
        </div>
      </section>

      {/* SURVEY */}
      <section id="survey" className="py-24 px-6 bg-[#FAF7F2]">
        <div className="max-w-xl mx-auto">
          <Fade><SectionTitle title="Опросы" sub="Помогите нам" /></Fade>
          <Fade delay={100}>
            {surveyDone ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-5">✨</div>
                <h3 className="font-cormorant text-3xl text-[#3D2B1F] mb-3">Спасибо за ответы!</h3>
                <p className="text-sm text-[#9B8878] font-montserrat">Ваши пожелания помогут создать идеальный праздник.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSurveyDone(true); }} className="space-y-6">
                {SURVEYS.map((s, i) => (
                  <div key={s.id} className="bg-white border border-[#E8D5BE] p-7 rounded-sm" style={{ boxShadow: "0 4px 30px rgba(61,43,31,0.05)" }}>
                    <p className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-1">Вопрос {i + 1}</p>
                    <h3 className="font-cormorant text-xl text-[#3D2B1F] mb-4">{s.q}</h3>
                    <div className="space-y-2">
                      {s.opts.map((opt) => (
                        <label key={opt} className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-all ${answers[s.id] === opt ? "border-[#B8976A] bg-[#B8976A]/5" : "border-[#E8D5BE] hover:border-[#B8976A]/50"}`}>
                          <input type="radio" name={`q${s.id}`} value={opt}
                            onChange={() => setAnswers({ ...answers, [s.id]: opt })} className="accent-[#B8976A]" />
                          <span className="text-sm font-montserrat text-[#4A4035]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="submit"
                  className="w-full py-3.5 bg-[#3D2B1F] text-[#FAF7F2] text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-[#4A4035] transition-colors rounded-sm">
                  Отправить пожелания
                </button>
              </form>
            )}
          </Fade>
        </div>
      </section>

      {/* MAP */}
      <section id="map" className="py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-5xl mx-auto">
          <Fade><SectionTitle title="Карта" sub="Как добраться" /></Fade>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "Car", title: "На автомобиле", text: "По Рублёво-Успенскому шоссе, 42 км от МКАД. Бесплатная парковка." },
              { icon: "Train", title: "На электричке", text: "С Белорусского вокзала до ст. Усово, далее такси 5 минут." },
              { icon: "Bus", title: "Трансфер", text: "Автобус от м. Строгино в 13:00. Бесплатно для гостей." },
            ].map((c, i) => (
              <Fade key={c.title} delay={i * 100}>
                <div className="bg-white border border-[#E8D5BE] p-6 rounded-sm text-center" style={{ boxShadow: "0 4px 30px rgba(61,43,31,0.05)" }}>
                  <Icon name={c.icon as "Car"} size={22} className="text-[#B8976A] mx-auto mb-3" />
                  <h3 className="font-cormorant text-xl text-[#3D2B1F] mb-2">{c.title}</h3>
                  <p className="text-xs text-[#9B8878] font-montserrat leading-relaxed">{c.text}</p>
                </div>
              </Fade>
            ))}
          </div>
          <Fade delay={200}>
            <div className="border border-[#E8D5BE] rounded-sm overflow-hidden">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.2219%2C55.7494&z=12&pt=37.2219,55.7494,pm2rdm&lang=ru_RU"
                width="100%" height="420" style={{ border: 0, display: "block" }}
                allowFullScreen loading="lazy" title="Карта" />
            </div>
          </Fade>
        </div>
      </section>

      {/* MUSIC */}
      <section id="music" className="py-24 px-6 bg-[#3D2B1F]">
        <div className="max-w-xl mx-auto">
          <Fade>
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.5em] text-[#B8976A] font-montserrat uppercase mb-3">Атмосфера</p>
              <h2 className="font-cormorant text-4xl md:text-5xl font-light text-[#FAF7F2] mb-5">Музыка</h2>
              <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mx-auto" />
            </div>
          </Fade>
          <Fade delay={100}>
            <div className="rounded-sm border border-white/10 p-8 bg-[#4A4035]/50">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-16 h-16 rounded-sm bg-[#B8976A]/20 flex items-center justify-center shrink-0">
                  <Icon name="Music" size={22} className="text-[#B8976A]" />
                </div>
                <div>
                  <p className="font-cormorant text-xl text-white">{TRACKS[currentTrack].title}</p>
                  <p className="text-xs text-white/40 font-montserrat mt-0.5">{TRACKS[currentTrack].sub}</p>
                </div>
              </div>
              <input type="range" className="progress-bar mb-1" defaultValue={30} />
              <div className="flex justify-between text-[10px] text-white/35 font-montserrat mb-6"><span>1:24</span><span>4:23</span></div>
              <div className="flex items-center justify-center gap-7 mb-6">
                <button onClick={() => setCurrentTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length)} className="text-white/35 hover:text-white transition-colors">
                  <Icon name="SkipBack" size={20} />
                </button>
                <button onClick={() => setPlaying(!playing)}
                  className="w-13 h-13 w-12 h-12 rounded-full bg-[#B8976A] flex items-center justify-center hover:bg-[#C9897A] transition-colors">
                  <Icon name={playing ? "Pause" : "Play"} size={20} className="text-white" />
                </button>
                <button onClick={() => setCurrentTrack((currentTrack + 1) % TRACKS.length)} className="text-white/35 hover:text-white transition-colors">
                  <Icon name="SkipForward" size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Volume2" size={14} className="text-white/35" />
                <input type="range" className="progress-bar flex-1" value={volume} onChange={(e) => setVolume(+e.target.value)} />
                <span className="text-[10px] text-white/35 font-montserrat w-5">{volume}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {TRACKS.map((t, i) => (
                <button key={t.title} onClick={() => setCurrentTrack(i)}
                  className={`w-full flex items-center gap-4 p-4 rounded-sm border transition-all ${currentTrack === i ? "border-[#B8976A]/40 bg-white/5" : "border-white/5 hover:border-white/15"}`}>
                  <span className="text-xs text-white/25 font-montserrat w-4">{i + 1}</span>
                  <Icon name="Music2" size={13} className="text-[#B8976A]/60" />
                  <div className="flex-1 text-left">
                    <p className="text-sm text-white/75 font-montserrat">{t.title}</p>
                    <p className="text-xs text-white/30 font-montserrat">{t.sub}</p>
                  </div>
                  {currentTrack === i && (
                    <div className="flex gap-0.5 items-end h-4">
                      {[3, 5, 2, 6, 4].map((h, j) => (
                        <div key={j} className="w-0.5 bg-[#B8976A] rounded animate-bounce" style={{ height: `${h * 3}px`, animationDelay: `${j * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-24 px-6 bg-[#FAF7F2]">
        <div className="max-w-5xl mx-auto">
          <Fade><SectionTitle title="Галерея" sub="Наши моменты" /></Fade>
          <Fade delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} onClick={() => setLightbox(HERO_IMAGE)}
                  className="aspect-square overflow-hidden cursor-pointer group relative rounded-sm">
                  <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[#3D2B1F]/0 group-hover:bg-[#3D2B1F]/25 transition-all duration-300 flex items-center justify-center">
                    <Icon name="ZoomIn" size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors">
            <Icon name="X" size={24} />
          </button>
          <img src={lightbox} alt="" className="max-h-[88vh] max-w-full object-contain rounded-sm" />
        </div>
      )}

      {/* CONTACTS */}
      <section id="contacts" className="py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto">
          <Fade><SectionTitle title="Контакты" sub="Связаться с нами" /></Fade>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "Phone", title: "Александр", sub: "Жених", val: "+7 (999) 123-45-67" },
              { icon: "Phone", title: "Мария", sub: "Невеста", val: "+7 (999) 765-43-21" },
              { icon: "Users", title: "Ведущий Иван", sub: "По вопросам программы", val: "+7 (916) 555-00-11" },
              { icon: "Mail", title: "Email", sub: "Общие вопросы", val: "wedding@example.com" },
            ].map((c, i) => (
              <Fade key={c.sub} delay={i * 80}>
                <div className="bg-white border border-[#E8D5BE] p-6 rounded-sm flex items-start gap-4" style={{ boxShadow: "0 4px 30px rgba(61,43,31,0.05)" }}>
                  <div className="w-10 h-10 rounded-full bg-[#E8C4B0]/30 flex items-center justify-center shrink-0">
                    <Icon name={c.icon as "Phone"} size={15} className="text-[#B8976A]" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.25em] text-[#B8976A] font-montserrat uppercase">{c.sub}</p>
                    <h3 className="font-cormorant text-xl text-[#3D2B1F]">{c.title}</h3>
                    <p className="text-sm text-[#9B8878] font-montserrat mt-0.5">{c.val}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>

          <Fade delay={350}>
            <div className="text-center mt-20 pb-6">
              <span className="text-[#B8976A] tracking-[0.5em] text-lg">✦ ✦ ✦</span>
              <h2 className="font-cormorant text-4xl font-light text-[#3D2B1F] mt-5 mb-2">
                До встречи на нашем торжестве
              </h2>
              <p className="text-sm text-[#9B8878] font-montserrat italic">С любовью, Александр & Мария</p>
              <p className="text-[10px] tracking-[0.5em] text-[#B8976A] font-montserrat uppercase mt-7">12 · IX · 2026</p>
            </div>
          </Fade>
        </div>
      </section>
    </div>
  );
}
