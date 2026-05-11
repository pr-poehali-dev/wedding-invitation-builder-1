import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { HERO_IMAGE, NAV_ITEMS, Fade, SectionTitle } from "./wedding-shared";
import { useWedding } from "@/context/WeddingContext";

const AUTH_KEY = "wedding_admin_auth";

interface WeddingTopProps {
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
  activeNav: string;
  cd: { d: number; h: number; m: number; s: number };
  go: (id: string) => void;
}

export default function WeddingTop({ navOpen, setNavOpen, activeNav, cd, go }: WeddingTopProps) {
  const { data } = useWedding();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem(AUTH_KEY) === "true";

  const weddingDateLabel = new Date(data.weddingDate).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  const timeline = data.timelineTitles.map((title, i) => ({
    year: data.timelineYears[i] ?? "",
    title,
    text: data.timelineTexts[i] ?? "",
  }));

  return (
    <>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-sm border-b border-[#E8C4B0]/30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => go("hero")} className="font-cormorant text-xl tracking-widest text-[#3D2B1F] font-light">
            {data.groomName?.[0] ?? "А"} & {data.brideName?.[0] ?? "М"}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isAdmin ? "/admin/panel" : "/admin")}
              className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] font-montserrat text-[#9B8878] hover:text-[#B8976A] transition-colors uppercase"
              title={isAdmin ? "Панель управления" : "Войти"}
            >
              <Icon name={isAdmin ? "Crown" : "Lock"} size={14} className="text-[#B8976A]" />
              <span className="hidden sm:inline">{isAdmin ? "Кабинет" : "Войти"}</span>
            </button>
            <button className="md:hidden" onClick={() => setNavOpen(!navOpen)}>
              <Icon name={navOpen ? "X" : "Menu"} size={20} className="text-[#4A4035]" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-5">
            {NAV_ITEMS.map((n) => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`nav-link text-[10px] tracking-[0.18em] font-montserrat uppercase transition-colors ${activeNav === n.id ? "text-[#B8976A]" : "text-[#9B8878] hover:text-[#3D2B1F]"}`}>
                {n.label}
              </button>
            ))}
            <button
              onClick={() => navigate(isAdmin ? "/admin/panel" : "/admin")}
              className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] font-montserrat text-[#9B8878] hover:text-[#B8976A] transition-colors uppercase border border-[#E8D5BE] hover:border-[#B8976A] px-3 py-1.5 rounded-sm"
            >
              <Icon name={isAdmin ? "Crown" : "Lock"} size={12} className="text-[#B8976A]" />
              {isAdmin ? "Кабинет" : "Войти"}
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden bg-[#F5F0E8] border-t border-[#E8C4B0]/30 py-3">
            {NAV_ITEMS.map((n) => (
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
            {data.groomName}
          </h1>
          <p className="font-cormorant text-4xl md:text-5xl italic text-[#E8C4B0] mb-2 animate-fade-up" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
            &amp;
          </p>
          <h1 className="font-cormorant text-6xl md:text-8xl font-light text-white leading-none animate-fade-up" style={{ animationDelay: "1s", animationFillMode: "both" }}>
            {data.brideName}
          </h1>
          <div className="animate-fade-up" style={{ animationDelay: "1.2s", animationFillMode: "both" }}>
            <div className="w-48 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto my-7" />
            <p className="font-cormorant text-xl text-white/80 italic tracking-wider">{weddingDateLabel}</p>
            <p className="text-[10px] tracking-[0.35em] text-white/55 font-montserrat uppercase mt-1">
              {data.venueName} · {data.venueAddress}
            </p>
          </div>
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
            {timeline.map((item, i) => (
              <Fade key={item.year + i} delay={i * 120}>
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
              {
                icon: "Calendar", title: "Дата",
                lines: [weddingDateLabel, new Date(data.weddingDate).toLocaleDateString("ru-RU", { weekday: "long" }), `Начало в ${data.weddingTime}`],
              },
              {
                icon: "MapPin", title: "Место",
                lines: [data.venueName, data.venueAddress, "Московская область"],
              },
              {
                icon: "Clock", title: "Программа",
                lines: [`${data.weddingTime} — Церемония`, "15:30 — Банкет", "23:00 — Окончание"],
              },
            ].map((c, i) => (
              <Fade key={c.title} delay={i * 100}>
                <div className="bg-white border border-[#E8D5BE] p-8 text-center shadow-sm rounded-sm" style={{ boxShadow: "0 4px 40px rgba(61,43,31,0.06)" }}>
                  <div className="w-11 h-11 rounded-full bg-[#E8C4B0]/30 flex items-center justify-center mx-auto mb-4">
                    <Icon name={c.icon as "Calendar"} size={18} className="text-[#B8976A]" />
                  </div>
                  <h3 className="font-cormorant text-2xl font-medium text-[#3D2B1F] mb-3">{c.title}</h3>
                  <div className="w-10 h-px bg-[#B8976A]/50 mx-auto mb-4" />
                  {c.lines.map((l) => <p key={l} className="text-sm text-[#9B8878] font-montserrat leading-loose capitalize">{l}</p>)}
                </div>
              </Fade>
            ))}
          </div>
          <Fade delay={250}>
            <div className="mt-9 bg-white border border-[#E8D5BE] p-8 text-center max-w-xl mx-auto rounded-sm" style={{ boxShadow: "0 4px 40px rgba(61,43,31,0.06)" }}>
              <p className="text-[10px] tracking-[0.35em] text-[#B8976A] font-montserrat uppercase mb-2">Дресс-код</p>
              <p className="text-sm text-[#9B8878] font-montserrat leading-relaxed">{data.dressCode}</p>
              <div className="flex gap-2 justify-center mt-5">
                {["#FAF7F2","#E8C4B0","#C9897A","#B8976A","#7A9B6E","#9B8878"].map(c => (
                  <div key={c} className="w-6 h-6 rounded-full border border-[#E8D5BE]" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </section>
    </>
  );
}