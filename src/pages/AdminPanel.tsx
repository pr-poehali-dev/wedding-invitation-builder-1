import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useWedding, WeddingData } from "@/context/WeddingContext";
import { TEMPLATES, FONTS } from "@/components/wedding/wedding-shared";

const AUTH_KEY = "wedding_admin_auth";

type Tab = "general" | "story" | "details" | "contacts" | "photos" | "music" | "registrations" | "texts" | "notes";

const REG_KEY = "wedding_reg_list";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { data, saveData, setData, loading } = useWedding();
  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState<WeddingData>({ ...data });

  useEffect(() => {
    if (!loading) setForm({ ...data });
  }, [loading]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [audioProgress, setAudioProgress] = useState(0);
  const [regList] = useState<Array<Record<string, string>>>(() => {
    try { return JSON.parse(localStorage.getItem(REG_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    navigate("/admin");
  };

  const handleSave = async () => {
    setSaveError("");
    const token = localStorage.getItem("wedding_admin_token") || "";
    try {
      await saveData(form, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Ошибка сохранения. Проверьте подключение.");
    }
  };

  const set = (key: keyof WeddingData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("https://functions.poehali.dev/6275b039-e891-49fe-b873-328dac578f98", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, contentType: file.type }),
        });
        const json = await res.json();
        if (json.url) {
          const updated = { ...form, galleryPhotos: [...(form.galleryPhotos || []), json.url] };
          setForm(updated);
          setData(updated);
        } else {
          setPhotoError("Ошибка загрузки. Попробуйте ещё раз.");
        }
      } catch {
        setPhotoError("Ошибка сети. Проверьте соединение.");
      } finally {
        setPhotoUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setAudioError("Файл слишком большой. Максимум 50 МБ.");
      return;
    }
    setAudioUploading(true);
    setAudioError("");
    setAudioProgress(0);
    try {
      // Получаем presigned URL
      const presignRes = await fetch("https://functions.poehali.dev/66da2b79-7e31-4e71-acfa-d2454958f969", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error("presign_failed");
      const { uploadUrl, cdnUrl } = await presignRes.json();
      setAudioProgress(10);

      // Загружаем файл напрямую в S3 с отслеживанием прогресса
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setAudioProgress(10 + Math.round((ev.loaded / ev.total) * 88));
        };
        xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`s3_${xhr.status}`));
        xhr.onerror = () => reject(new Error("network"));
        xhr.send(file);
      });

      setAudioProgress(100);
      const updated = { ...form, audioUrl: cdnUrl, audioName: file.name };
      setForm(updated);
      setData(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "presign_failed") setAudioError("Не удалось подготовить загрузку. Попробуйте ещё раз.");
      else if (msg.startsWith("s3_")) setAudioError(`Ошибка загрузки в хранилище (${msg}). Попробуйте ещё раз.`);
      else setAudioError("Ошибка сети. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setAudioUploading(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  const handleRemoveAudio = () => {
    const updated = { ...form, audioUrl: "", audioName: "" };
    setForm(updated);
    setData(updated);
  };

  const handleDeletePhoto = (idx: number) => {
    const updated = { ...form, galleryPhotos: form.galleryPhotos.filter((_, i) => i !== idx) };
    setForm(updated);
    setData(updated);
  };

  const inputCls = "w-full px-3 py-2.5 border border-[#E8D5BE] bg-white text-sm text-[#4A4035] font-montserrat focus:outline-none focus:border-[#B8976A] rounded-sm transition-colors";
  const labelCls = "block text-[10px] tracking-[0.25em] text-[#B8976A] font-montserrat uppercase mb-1.5";

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "general", label: "Общее", icon: "Settings" },
    { id: "texts", label: "Тексты", icon: "Type" },
    { id: "story", label: "Цитата", icon: "Quote" },
    { id: "details", label: "Детали", icon: "Calendar" },
    { id: "contacts", label: "Контакты", icon: "Phone" },
    { id: "notes", label: "Примечания", icon: "StickyNote" },
    { id: "photos", label: "Фото", icon: "Image" },
    { id: "music", label: "Музыка", icon: "Music" },
    { id: "registrations", label: "Регистрации", icon: "ClipboardList" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="bg-[#3D2B1F] text-[#FAF7F2] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Icon name="Crown" size={18} className="text-[#B8976A]" />
          <span className="font-cormorant text-xl tracking-wider">Панель управления</span>
          <span className="hidden md:inline text-[10px] tracking-widest text-[#B8976A] font-montserrat uppercase ml-2">— А & М</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")}
            className="text-xs text-[#9B8878] hover:text-[#FAF7F2] font-montserrat transition-colors flex items-center gap-1.5">
            <Icon name="Eye" size={14} />
            <span className="hidden sm:inline">Просмотр сайта</span>
          </button>
          <button onClick={logout}
            className="text-xs text-[#9B8878] hover:text-[#FAF7F2] font-montserrat transition-colors flex items-center gap-1.5">
            <Icon name="LogOut" size={14} />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-white border-r border-[#E8D5BE] hidden md:block">
          <nav className="py-4">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-montserrat transition-colors text-left ${
                  tab === t.id
                    ? "bg-[#FAF7F2] text-[#3D2B1F] border-r-2 border-[#B8976A]"
                    : "text-[#9B8878] hover:text-[#3D2B1F] hover:bg-[#FAF7F2]/50"
                }`}>
                <Icon name={t.icon as "Settings"} size={15} className={tab === t.id ? "text-[#B8976A]" : "text-[#9B8878]"} />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden w-full absolute">
          <div className="flex overflow-x-auto bg-white border-b border-[#E8D5BE] px-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`shrink-0 px-4 py-3 text-xs font-montserrat border-b-2 transition-colors ${
                  tab === t.id ? "border-[#B8976A] text-[#3D2B1F]" : "border-transparent text-[#9B8878]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 md:pt-6 pt-14 max-w-2xl">

          {/* TEXTS */}
          {tab === "texts" && (
            <div className="space-y-8">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Тексты сайта</h2>

              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase border-b border-[#E8D5BE] pb-2">Главный экран</h3>
                <div>
                  <label className={labelCls}>Надпись над именами</label>
                  <input className={inputCls} value={form.heroTagline} onChange={(e) => set("heroTagline", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Текст кнопки</label>
                  <input className={inputCls} value={form.heroBtn} onChange={(e) => set("heroBtn", e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase border-b border-[#E8D5BE] pb-2">Раздел «Цитата»</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Заголовок</label>
                    <input className={inputCls} value={form.quoteTitle} onChange={(e) => set("quoteTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Подзаголовок</label>
                    <input className={inputCls} value={form.quoteSub} onChange={(e) => set("quoteSub", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Текст цитаты</label>
                  <textarea className={`${inputCls} min-h-[90px]`} value={form.quoteText} onChange={(e) => set("quoteText", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Автор</label>
                  <input className={inputCls} value={form.quoteAuthor} onChange={(e) => set("quoteAuthor", e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase border-b border-[#E8D5BE] pb-2">Раздел «Детали»</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Заголовок</label>
                    <input className={inputCls} value={form.detailsTitle} onChange={(e) => set("detailsTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Подзаголовок</label>
                    <input className={inputCls} value={form.detailsSub} onChange={(e) => set("detailsSub", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Регион площадки</label>
                  <input className={inputCls} value={form.venueRegion} onChange={(e) => set("venueRegion", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Программа (каждая строка — отдельный пункт)</label>
                  {(form.programLines || []).map((line, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        className={inputCls}
                        value={line}
                        onChange={(e) => {
                          const arr = [...(form.programLines || [])];
                          arr[i] = e.target.value;
                          setForm((f) => ({ ...f, programLines: arr }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, programLines: (f.programLines || []).filter((_, j) => j !== i) }))}
                        className="px-3 py-2 text-[#C9897A] border border-[#E8D5BE] rounded-sm hover:bg-[#C9897A]/10 transition-colors shrink-0 text-sm"
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, programLines: [...(f.programLines || []), ""] }))}
                    className="text-[10px] tracking-widest font-montserrat uppercase text-[#B8976A] hover:text-[#3D2B1F] transition-colors"
                  >+ Добавить пункт</button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase border-b border-[#E8D5BE] pb-2">Раздел «RSVP»</h3>
                <div>
                  <label className={labelCls}>Дедлайн ответа</label>
                  <input className={inputCls} value={form.rsvpDeadline} onChange={(e) => set("rsvpDeadline", e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase border-b border-[#E8D5BE] pb-2">Метка на карте</h3>
                <p className="text-xs text-[#9B8878] font-montserrat">Координаты места проведения. Найти можно на <a href="https://yandex.ru/maps" target="_blank" rel="noreferrer" className="text-[#B8976A] underline">yandex.ru/maps</a> — правый клик по точке → «Что здесь?»</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Широта (Lat)</label>
                    <input className={inputCls} value={form.mapLat} onChange={(e) => set("mapLat", e.target.value)} placeholder="55.7494" />
                  </div>
                  <div>
                    <label className={labelCls}>Долгота (Lng)</label>
                    <input className={inputCls} value={form.mapLng} onChange={(e) => set("mapLng", e.target.value)} placeholder="37.2219" />
                  </div>
                </div>
                <div className="border border-[#E8D5BE] rounded-sm overflow-hidden">
                  <iframe
                    src={`https://yandex.ru/map-widget/v1/?ll=${form.mapLng}%2C${form.mapLat}&z=15&pt=${form.mapLng},${form.mapLat},pm2rdm&lang=ru_RU`}
                    width="100%" height="260" style={{ border: 0, display: "block" }}
                    allowFullScreen loading="lazy" title="Предпросмотр карты"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase border-b border-[#E8D5BE] pb-2">Раздел «Как добраться»</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Заголовок 1</label>
                    <input className={inputCls} value={form.mapCarTitle} onChange={(e) => set("mapCarTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Описание 1</label>
                    <input className={inputCls} value={form.mapCarText} onChange={(e) => set("mapCarText", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Заголовок 2</label>
                    <input className={inputCls} value={form.mapTrainTitle} onChange={(e) => set("mapTrainTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Описание 2</label>
                    <input className={inputCls} value={form.mapTrainText} onChange={(e) => set("mapTrainText", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Заголовок 3</label>
                    <input className={inputCls} value={form.mapBusTitle} onChange={(e) => set("mapBusTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Описание 3</label>
                    <input className={inputCls} value={form.mapBusText} onChange={(e) => set("mapBusText", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase border-b border-[#E8D5BE] pb-2">Подвал сайта</h3>
                <div>
                  <label className={labelCls}>Заголовок</label>
                  <input className={inputCls} value={form.footerTitle} onChange={(e) => set("footerTitle", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Подпись («С любовью, Имена»)</label>
                  <input className={inputCls} value={form.footerSub} onChange={(e) => set("footerSub", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* GENERAL */}
          {tab === "general" && (
            <div className="space-y-6">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Общая информация</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Имя жениха</label>
                  <input className={inputCls} value={form.groomName} onChange={(e) => set("groomName", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Имя невесты</label>
                  <input className={inputCls} value={form.brideName} onChange={(e) => set("brideName", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Дата свадьбы</label>
                  <input type="date" className={inputCls} value={form.weddingDate.slice(0, 10)}
                    onChange={(e) => set("weddingDate", e.target.value + "T" + form.weddingTime + ":00")} />
                </div>
                <div>
                  <label className={labelCls}>Время</label>
                  <input type="time" className={inputCls} value={form.weddingTime}
                    onChange={(e) => set("weddingTime", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Название площадки</label>
                <input className={inputCls} value={form.venueName} onChange={(e) => set("venueName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Адрес</label>
                <input className={inputCls} value={form.venueAddress} onChange={(e) => set("venueAddress", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Дресс-код</label>
                <textarea rows={3} className={inputCls + " resize-none"} value={form.dressCode}
                  onChange={(e) => set("dressCode", e.target.value)} />
                <div className="mt-3">
                  <p className="text-[10px] font-montserrat text-[#9B8878] uppercase tracking-wider mb-2">Цвета дресс-кода (до 8 штук)</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(form.dressCodeColors || []).map((color, i) => (
                      <div key={i} className="relative group">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const updated = [...(form.dressCodeColors || [])];
                            updated[i] = e.target.value;
                            setForm((f) => ({ ...f, dressCodeColors: updated }));
                          }}
                          className="w-9 h-9 rounded-full border-2 border-[#E8D5BE] cursor-pointer appearance-none p-0.5 bg-transparent"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (form.dressCodeColors || []).filter((_, j) => j !== i);
                            setForm((f) => ({ ...f, dressCodeColors: updated }));
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9897A] text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                    {(form.dressCodeColors || []).length < 8 && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, dressCodeColors: [...(f.dressCodeColors || []), "#E8C4B0"] }))}
                        className="w-9 h-9 rounded-full border-2 border-dashed border-[#B8976A] flex items-center justify-center text-[#B8976A] text-lg hover:bg-[#B8976A]/10 transition-colors"
                        title="Добавить цвет"
                      >+</button>
                    )}
                  </div>
                  <p className="text-[10px] font-montserrat text-[#C9897A]/70">Нажмите на кружок, чтобы изменить цвет. Наведите — появится кнопка удаления.</p>
                </div>
              </div>
            </div>
          )}

          {/* QUOTE */}
          {tab === "story" && (
            <div className="space-y-6">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Цитата дня</h2>
              <p className="text-xs text-[#9B8878] font-montserrat">Красивая цитата, которая встретит гостей на сайте.</p>
              <div className="bg-white border border-[#E8D5BE] p-5 rounded-sm space-y-4"
                style={{ boxShadow: "0 2px 20px rgba(61,43,31,0.04)" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Заголовок раздела</label>
                    <input className={inputCls} value={form.quoteTitle} onChange={(e) => set("quoteTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Подзаголовок</label>
                    <input className={inputCls} value={form.quoteSub} onChange={(e) => set("quoteSub", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Текст цитаты</label>
                  <textarea rows={3} className={inputCls + " resize-none"} value={form.quoteText} onChange={(e) => set("quoteText", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Автор</label>
                  <input className={inputCls} value={form.quoteAuthor} onChange={(e) => set("quoteAuthor", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* DETAILS */}
          {tab === "details" && (
            <div className="space-y-6">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Детали события</h2>
              <p className="text-xs text-[#9B8878] font-montserrat">Информация берётся из раздела «Общее». Здесь можно настроить шаблон и шрифт.</p>

              <div>
                <label className={labelCls}>Шаблон приглашения</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => set("tmplId", t.id)}
                      className={`p-4 rounded-sm border-2 transition-all ${t.bg} ${form.tmplId === t.id ? "border-[#B8976A]" : "border-[#E8D5BE] hover:border-[#B8976A]/50"}`}>
                      <span className={`font-cormorant text-lg ${t.accent}`}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Шрифт</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FONTS.map((f) => (
                    <button key={f.id} onClick={() => set("fontId", f.id)}
                      className={`px-4 py-2 border text-sm transition-all rounded-sm ${f.cls} ${form.fontId === f.id ? "border-[#B8976A] bg-[#B8976A]/10 text-[#3D2B1F]" : "border-[#E8D5BE] text-[#9B8878] hover:border-[#B8976A]"}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {tab === "contacts" && (
            <div className="space-y-5">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Контакты</h2>
              <div>
                <label className={labelCls}>Телефон жениха</label>
                <input className={inputCls} value={form.contactGroom} onChange={(e) => set("contactGroom", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Телефон невесты</label>
                <input className={inputCls} value={form.contactBride} onChange={(e) => set("contactBride", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Телефон ведущего</label>
                <input className={inputCls} value={form.contactHost} onChange={(e) => set("contactHost", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              </div>
            </div>
          )}



          {/* NOTES */}
          {tab === "notes" && (
            <div className="space-y-5">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Примечания</h2>
              <p className="text-xs text-[#9B8878] font-montserrat">Каждая строка — отдельный пункт на сайте.</p>
              {(form.notes || []).map((note, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    className={inputCls + " flex-1"}
                    value={note}
                    placeholder={`Примечание ${i + 1}`}
                    onChange={(e) => {
                      const arr = [...(form.notes || [])];
                      arr[i] = e.target.value;
                      setForm((f) => ({ ...f, notes: arr }));
                    }}
                  />
                  <button
                    onClick={() => {
                      const arr = (form.notes || []).filter((_, j) => j !== i);
                      setForm((f) => ({ ...f, notes: arr }));
                    }}
                    className="px-3 py-2.5 border border-[#E8D5BE] text-[#9B8878] hover:text-[#C9897A] hover:border-[#C9897A] rounded-sm transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setForm((f) => ({ ...f, notes: [...(f.notes || []), ""] }))}
                className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#B8976A] font-montserrat uppercase border border-[#E8D5BE] hover:border-[#B8976A] px-4 py-2.5 rounded-sm transition-colors"
              >
                <Icon name="Plus" size={13} /> Добавить примечание
              </button>
            </div>
          )}

          {/* PHOTOS */}
          {tab === "photos" && (
            <div className="space-y-6">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Фотографии галереи</h2>

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E8D5BE] rounded-sm p-10 text-center cursor-pointer hover:border-[#B8976A] transition-colors group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                {photoUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#B8976A]/30 border-t-[#B8976A] rounded-full animate-spin" />
                    <p className="text-sm text-[#9B8878] font-montserrat">Загружаем фото...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8C4B0]/30 flex items-center justify-center group-hover:bg-[#E8C4B0]/50 transition-colors">
                      <Icon name="Upload" size={20} className="text-[#B8976A]" />
                    </div>
                    <p className="text-sm text-[#4A4035] font-montserrat">Нажмите, чтобы добавить фото</p>
                    <p className="text-xs text-[#9B8878] font-montserrat">JPG, PNG, WEBP до 5 МБ</p>
                  </div>
                )}
              </div>

              {photoError && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-montserrat bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
                  <Icon name="AlertCircle" size={13} />
                  {photoError}
                </div>
              )}

              {/* Grid */}
              {(form.galleryPhotos || []).length === 0 ? (
                <div className="bg-white border border-[#E8D5BE] p-6 rounded-sm text-center">
                  <p className="text-sm text-[#9B8878] font-montserrat">Фотографии ещё не добавлены</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(form.galleryPhotos || []).map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-sm overflow-hidden border border-[#E8D5BE]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeletePhoto(i)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Icon name="X" size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#9B8878] font-montserrat">
                Всего фото: {(form.galleryPhotos || []).length}. Фотографии отображаются в галерее на сайте.
              </p>
            </div>
          )}

          {/* MUSIC */}
          {tab === "music" && (
            <div className="space-y-6">
              <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Фоновая музыка</h2>
              <p className="text-xs text-[#9B8878] font-montserrat leading-relaxed">
                Загрузите MP3-файл — он будет автоматически играть фоном при открытии сайта.
                Максимальный размер: 20 МБ.
              </p>

              {/* Current track */}
              {form.audioUrl ? (
                <div className="bg-[#3D2B1F] rounded-sm p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#B8976A]/20 flex items-center justify-center shrink-0">
                    <Icon name="Music2" size={18} className="text-[#B8976A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-0.5">Текущий трек</p>
                    <p className="text-sm text-white font-montserrat truncate">{form.audioName || "Загруженный трек"}</p>
                    <audio controls src={form.audioUrl} className="mt-2 w-full h-8 opacity-70" />
                  </div>
                  <button
                    onClick={handleRemoveAudio}
                    className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition-colors"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#E8D5BE] rounded-sm p-5 text-center">
                  <Icon name="MusicOff" size={22} className="text-[#9B8878] mx-auto mb-2" />
                  <p className="text-sm text-[#9B8878] font-montserrat">Своя музыка не загружена</p>
                  <p className="text-xs text-[#B8976A] font-montserrat mt-1">Играют стандартные треки плеера</p>
                </div>
              )}

              {/* Upload area */}
              <div
                onClick={() => !audioUploading && audioInputRef.current?.click()}
                className={`border-2 border-dashed rounded-sm p-10 text-center transition-colors ${audioUploading ? "border-[#B8976A] cursor-default" : "border-[#E8D5BE] cursor-pointer hover:border-[#B8976A]"} group`}
              >
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
                {audioUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#B8976A]/30 border-t-[#B8976A] rounded-full animate-spin" />
                    <p className="text-sm text-[#9B8878] font-montserrat">Загружаем трек...</p>
                    <div className="w-48 h-1.5 bg-[#E8D5BE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B8976A] rounded-full transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#B8976A] font-montserrat">{audioProgress}%</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8C4B0]/30 flex items-center justify-center group-hover:bg-[#E8C4B0]/50 transition-colors">
                      <Icon name="Upload" size={20} className="text-[#B8976A]" />
                    </div>
                    <p className="text-sm text-[#4A4035] font-montserrat">
                      {form.audioUrl ? "Заменить трек" : "Нажмите, чтобы загрузить MP3"}
                    </p>
                    <p className="text-xs text-[#9B8878] font-montserrat">MP3, WAV, OGG, AAC до 20 МБ</p>
                  </div>
                )}
              </div>

              {audioError && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-montserrat bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
                  <Icon name="AlertCircle" size={13} />
                  {audioError}
                </div>
              )}

              <div className="bg-[#F5F0E8] border border-[#E8D5BE] rounded-sm p-4 text-xs text-[#9B8878] font-montserrat space-y-1.5">
                <p className="flex items-center gap-2"><Icon name="Info" size={12} className="text-[#B8976A] shrink-0" /> На десктопе музыка включается автоматически при открытии сайта.</p>
                <p className="flex items-center gap-2"><Icon name="Smartphone" size={12} className="text-[#B8976A] shrink-0" /> На мобильных браузер спрашивает разрешение — гость нажмет «Включить».</p>
              </div>
            </div>
          )}

          {/* REGISTRATIONS */}
          {tab === "registrations" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-cormorant text-2xl text-[#3D2B1F]">Регистрации гостей</h2>
                <span className="text-xs font-montserrat text-[#9B8878] border border-[#E8D5BE] px-3 py-1 rounded-full">
                  {regList.length} чел.
                </span>
              </div>

              {regList.length === 0 ? (
                <div className="bg-white border border-[#E8D5BE] p-10 rounded-sm text-center">
                  <p className="text-sm text-[#9B8878] font-montserrat">Регистраций пока нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {regList.map((r, i) => (
                    <div key={i} className="bg-white border border-[#E8D5BE] p-5 rounded-sm" style={{ boxShadow: "0 2px 20px rgba(61,43,31,0.04)" }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-cormorant text-lg text-[#3D2B1F]">{r.name}</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {r.phone && <p className="text-xs text-[#9B8878] font-montserrat">{r.phone}</p>}
                            {r.email && <p className="text-xs text-[#9B8878] font-montserrat">{r.email}</p>}
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs font-montserrat px-2.5 py-1 rounded-full border ${
                          r.attending === "yes"
                            ? "border-[#B8976A] text-[#B8976A] bg-[#B8976A]/5"
                            : "border-[#C9897A] text-[#C9897A] bg-[#C9897A]/5"
                        }`}>
                          {r.attending === "yes" ? "Придёт" : "Не придёт"}
                        </span>
                      </div>
                      {r.attending === "yes" && (
                        <div className="border-t border-[#E8D5BE] pt-3 flex flex-wrap gap-4 text-xs font-montserrat text-[#9B8878]">
                          {r.guests && <span>Гостей: <span className="text-[#4A4035]">{r.guests}</span></span>}
                          {r.menu && <span>Меню: <span className="text-[#4A4035]">{r.menu}</span></span>}
                          {r.wishes && <span>Пожелания: <span className="text-[#4A4035]">{r.wishes}</span></span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save button */}
          {tab !== "registrations" && tab !== "photos" && tab !== "music" && (
            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <button onClick={handleSave}
                className="px-8 py-3 bg-[#3D2B1F] text-[#FAF7F2] text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-[#4A4035] transition-colors rounded-sm flex items-center gap-2">
                <Icon name="Save" size={14} />
                Сохранить изменения
              </button>
              {saved && (
                <span className="text-xs text-[#7A9B6E] font-montserrat flex items-center gap-1.5 animate-fade-in">
                  <Icon name="CheckCircle" size={14} />
                  Сохранено!
                </span>
              )}
              {saveError && (
                <span className="text-xs text-red-500 font-montserrat">{saveError}</span>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}