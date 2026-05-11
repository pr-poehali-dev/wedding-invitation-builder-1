import { FONTS, TEMPLATES, SURVEYS, Fade, SectionTitle } from "./wedding-shared";
import { useWedding } from "@/context/WeddingContext";

type Template = typeof TEMPLATES[number];
type Font = typeof FONTS[number];

interface WeddingMiddleProps {
  tmpl: Template;
  setTmpl: (t: Template) => void;
  font: Font;
  setFont: (f: Font) => void;
  inviteText: string;
  setInviteText: (v: string) => void;
  rsvpName: string;
  setRsvpName: (v: string) => void;
  rsvpEmail: string;
  setRsvpEmail: (v: string) => void;
  rsvpStatus: "" | "yes" | "no";
  setRsvpStatus: (v: "" | "yes" | "no") => void;
  rsvpDone: boolean;
  setRsvpDone: (v: boolean) => void;
  answers: Record<number, string>;
  setAnswers: (v: Record<number, string>) => void;
  surveyDone: boolean;
  setSurveyDone: (v: boolean) => void;
}

const RSVP_KEY = "wedding_rsvp_list";
const SURVEY_KEY = "wedding_survey_list";

export default function WeddingMiddle({
  tmpl, setTmpl, font, setFont, inviteText, setInviteText,
  rsvpName, setRsvpName, rsvpEmail, setRsvpEmail,
  rsvpStatus, setRsvpStatus, rsvpDone, setRsvpDone,
  answers, setAnswers, surveyDone, setSurveyDone,
}: WeddingMiddleProps) {
  const { data } = useWedding();

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpStatus) return;
    const list = JSON.parse(localStorage.getItem(RSVP_KEY) || "[]");
    list.push({ name: rsvpName, email: rsvpEmail, status: rsvpStatus });
    localStorage.setItem(RSVP_KEY, JSON.stringify(list));
    setRsvpDone(true);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = JSON.parse(localStorage.getItem(SURVEY_KEY) || "[]");
    list.push(answers);
    localStorage.setItem(SURVEY_KEY, JSON.stringify(list));
    setSurveyDone(true);
  };

  return (
    <>
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
                  <h2 className={`text-3xl font-light mb-2 ${font.cls} ${tmpl.text}`}>{data.groomName} & {data.brideName}</h2>
                  <p className={`text-xs tracking-wider font-montserrat mb-6 ${tmpl.accent}`}>{new Date(data.weddingDate).toLocaleDateString("ru-RU")} · {data.venueName}</p>
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
              <form onSubmit={handleRsvpSubmit}
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
              <form onSubmit={handleSurveySubmit} className="space-y-6">
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
    </>
  );
}