import { useState } from "react";
import { SURVEYS, Fade, SectionTitle } from "./wedding-shared";
import { useWedding } from "@/context/WeddingContext";

interface WeddingMiddleProps {
  regDone: boolean;
  setRegDone: (v: boolean) => void;
}

const SAVE_URL = "https://functions.poehali.dev/a20d2510-dbb5-48dd-9faf-c45e0a14bc04";

export default function WeddingMiddle({ regDone, setRegDone }: WeddingMiddleProps) {
  const { data } = useWedding();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("1");
  const [menu, setMenu] = useState("");
  const [wishes, setWishes] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attending || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${SAVE_URL}?mode=guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, guests, menu, wishes, attending }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `server_error_${res.status}`);
      }
      setRegDone(true);
    } catch {
      setSubmitError("Не удалось отправить регистрацию. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-[#E8D5BE] bg-transparent text-sm text-[#4A4035] font-montserrat focus:outline-none focus:border-[#B8976A] rounded-sm transition-colors";
  const labelCls = "block text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-2";

  return (
    <>
      {/* REGISTRATION */}
      <section id="rsvp" className="py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-xl mx-auto">
          <Fade><SectionTitle title="Регистрация" sub="Подтвердите участие" /></Fade>
          <Fade delay={100}>
            {regDone ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-6">🌸</div>
                <h3 className="font-cormorant text-3xl text-[#3D2B1F] mb-3">
                  {attending === "yes" ? "Ждём вас!" : "Жаль, что не сможете..."}
                </h3>
                <p className="text-sm text-[#9B8878] font-montserrat leading-relaxed">
                  {attending === "yes"
                    ? `${name}, ваша регистрация принята. Увидимся на торжестве!`
                    : `${name}, спасибо, что сообщили. Будем скучать!`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}
                className="bg-white border border-[#E8D5BE] p-8 rounded-sm space-y-6"
                style={{ boxShadow: "0 4px 40px rgba(61,43,31,0.06)" }}>

                {/* Attending */}
                <div>
                  <label className={labelCls}>Вы придёте? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["yes", "no"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => setAttending(s)}
                        className={`py-3 border text-sm font-montserrat tracking-wider transition-all rounded-sm ${
                          attending === s
                            ? s === "yes" ? "border-[#B8976A] bg-[#B8976A]/10 text-[#3D2B1F]" : "border-[#C9897A] bg-[#C9897A]/10 text-[#3D2B1F]"
                            : "border-[#E8D5BE] text-[#9B8878] hover:border-[#B8976A]"
                        }`}>
                        {s === "yes" ? "С радостью приду" : "Не смогу"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className={labelCls}>Ваше имя *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Иванов Иван" className={inputCls} />
                </div>

                {/* Phone */}
                <div>
                  <label className={labelCls}>Телефон</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67" className={inputCls} />
                </div>

                {/* Email */}
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@example.com" className={inputCls} />
                </div>

                {attending === "yes" && (
                  <>
                    {/* Guests count */}
                    <div>
                      <label className={labelCls}>Количество гостей (включая вас)</label>
                      <select value={guests} onChange={(e) => setGuests(e.target.value)} className={inputCls}>
                        {["1", "2", "3", "4"].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Menu */}
                    <div>
                      <label className={labelCls}>Предпочтение по меню</label>
                      <div className="space-y-2">
                        {SURVEYS[0].opts.map((opt) => (
                          <label key={opt}
                            className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-all ${menu === opt ? "border-[#B8976A] bg-[#B8976A]/5" : "border-[#E8D5BE] hover:border-[#B8976A]/50"}`}>
                            <input type="radio" name="menu" value={opt}
                              onChange={() => setMenu(opt)} className="accent-[#B8976A]" />
                            <span className="text-sm font-montserrat text-[#4A4035]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Wishes */}
                    <div>
                      <label className={labelCls}>Пожелания или особые условия</label>
                      <textarea value={wishes} onChange={(e) => setWishes(e.target.value)}
                        rows={3} placeholder="Аллергии, особые пожелания..."
                        className={inputCls + " resize-none"} />
                    </div>
                  </>
                )}

                {submitError && (
                  <p className="text-xs text-red-500 font-montserrat text-center">{submitError}</p>
                )}
                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 bg-[#3D2B1F] text-[#FAF7F2] text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-[#4A4035] transition-colors rounded-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting && <span className="w-3.5 h-3.5 border border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />}
                  {submitting ? "Отправка..." : "Подтвердить регистрацию"}
                </button>
                <p className="text-xs text-[#9B8878] font-montserrat text-center">{data.rsvpDeadline}</p>
              </form>
            )}
          </Fade>
        </div>
      </section>
    </>
  );
}