import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { TEMPLATES, NAV_ITEMS, Fade, SectionTitle } from "./wedding-shared";
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
  const tmpl = TEMPLATES.find((t) => t.id === data.tmplId) ?? TEMPLATES[0];

  const weddingDateLabel = new Date(data.weddingDate).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-sm border-b border-[#E8C4B0]/30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => go("hero")} className="font-script text-3xl text-[#B8976A] leading-none">
            {data.groomName?.[0] ?? "А"}&amp;{data.brideName?.[0] ?? "М"}
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
          <img
            src={tmpl.heroImage}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className={`absolute inset-0 ${tmpl.overlayClass}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-5 animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <span className="w-10 h-px bg-[#E8C4B0]/60" />
            <Icon name="Heart" size={12} className="text-[#E8C4B0] fill-[#E8C4B0]/60" />
            <span className="w-10 h-px bg-[#E8C4B0]/60" />
          </div>

          <p className="text-[10px] tracking-[0.7em] text-white/75 font-montserrat uppercase mb-7 animate-fade-in" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
            {data.heroTagline}
          </p>

          <h1 className="font-display text-7xl md:text-[9rem] text-white leading-[0.95] mb-1 animate-fade-up drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]" style={{ animationDelay: "0.55s", animationFillMode: "both" }}>
            {data.groomName}
          </h1>
          <p className="font-script text-5xl md:text-7xl text-[#E8C4B0] -my-2 md:-my-4 animate-fade-up drop-shadow-[0_2px_14px_rgba(0,0,0,0.3)]" style={{ animationDelay: "0.75s", animationFillMode: "both" }}>
            &amp;
          </p>
          <h1 className="font-display text-7xl md:text-[9rem] text-white leading-[0.95] animate-fade-up drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]" style={{ animationDelay: "0.95s", animationFillMode: "both" }}>
            {data.brideName}
          </h1>

          <div className="animate-fade-up" style={{ animationDelay: "1.15s", animationFillMode: "both" }}>
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="w-20 h-px bg-gradient-to-r from-transparent to-white/50" />
              <Icon name="Flower2" size={14} className="text-[#E8C4B0]" />
              <div className="w-20 h-px bg-gradient-to-l from-transparent to-white/50" />
            </div>
            <p className="font-cormorant text-2xl text-white/90 italic tracking-wider">{weddingDateLabel}</p>
            <p className="text-[10px] tracking-[0.35em] text-white/60 font-montserrat uppercase mt-2">
              {data.venueName} · {data.venueAddress}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-3 max-w-xs mx-auto animate-fade-up" style={{ animationDelay: "1.4s", animationFillMode: "both" }}>
            {[{ v: cd.d, l: "дней" }, { v: cd.h, l: "часов" }, { v: cd.m, l: "минут" }, { v: cd.s, l: "секунд" }].map((c) => (
              <div key={c.l} className="text-center backdrop-blur-[2px]">
                <div className="font-cormorant text-3xl font-light text-white tabular-nums">{String(c.v).padStart(2, "0")}</div>
                <div className="text-[9px] tracking-widest text-white/55 font-montserrat uppercase mt-1">{c.l}</div>
              </div>
            ))}
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "1.6s", animationFillMode: "both" }}>
            <button onClick={() => go("rsvp")}
              className="mt-10 px-10 py-3.5 border border-white/50 text-white text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-white hover:text-[#3D2B1F] hover:border-white transition-all duration-300 rounded-sm">
              {data.heroBtn}
            </button>
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <Icon name="ChevronDown" size={20} />
        </div>
      </section>

      {/* QUOTE */}
      <section id="story" className="py-28 px-6 bg-[#FAF7F2] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #B8976A 0%, transparent 40%), radial-gradient(circle at 80% 70%, #C9897A 0%, transparent 40%)" }} />
        <div className="max-w-3xl mx-auto relative">
          <Fade><SectionTitle title={data.quoteTitle} sub={data.quoteSub} /></Fade>
          <Fade delay={150}>
            <div className="text-center px-4">
              <div className="font-cormorant text-[80px] md:text-[110px] leading-none text-[#B8976A]/30 select-none -mb-8">“</div>
              <p className="font-cormorant italic text-2xl md:text-3xl text-[#3D2B1F] leading-relaxed font-light max-w-2xl mx-auto">
                {data.quoteText}
              </p>
              <div className="flex items-center justify-center gap-4 mt-9">
                <div className="w-10 h-px bg-[#B8976A]/50" />
                <p className="text-[10px] tracking-[0.4em] text-[#B8976A] font-montserrat uppercase">{data.quoteAuthor}</p>
                <div className="w-10 h-px bg-[#B8976A]/50" />
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* DETAILS */}
      <section id="details" className="py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-5xl mx-auto">
          <Fade><SectionTitle title={data.detailsTitle} sub={data.detailsSub} /></Fade>
          <div className="grid md:grid-cols-3 gap-7">
            {[
              {
                icon: "Calendar", title: "Дата",
                lines: [weddingDateLabel, new Date(data.weddingDate).toLocaleDateString("ru-RU", { weekday: "long" }), `Начало в ${data.weddingTime}`],
              },
              {
                icon: "MapPin", title: "Место",
                lines: [data.venueName, data.venueAddress, data.venueRegion],
              },
              {
                icon: "Clock", title: "Программа",
                lines: data.programLines,
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
              {(data.dressCodeColors || []).length > 0 && (
                <div className="flex gap-2 justify-center mt-5 flex-wrap">
                  {(data.dressCodeColors || []).map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-[#E8D5BE]" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
              )}
            </div>
          </Fade>
        </div>
      </section>

      {/* NOTES */}
      {data.notes && data.notes.length > 0 && (
        <section id="notes" className="py-16 px-6 bg-[#FAF7F2]">
          <div className="max-w-2xl mx-auto">
            <Fade>
              <SectionTitle title="Примечания" sub="Важная информация" />
            </Fade>
            <div className="space-y-3">
              {data.notes.map((note, i) => (
                <Fade key={i} delay={i * 80}>
                  <div className="flex items-start gap-4 bg-white border border-[#E8D5BE] px-6 py-4 rounded-sm" style={{ boxShadow: "0 2px 20px rgba(61,43,31,0.04)" }}>
                    <span className="text-[#B8976A] mt-0.5 shrink-0">✦</span>
                    <p className="text-sm text-[#4A4035] font-montserrat leading-relaxed">{note}</p>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}