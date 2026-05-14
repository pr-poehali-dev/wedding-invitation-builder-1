import Icon from "@/components/ui/icon";
import { HERO_IMAGE, TRACKS, Fade, SectionTitle } from "./wedding-shared";
import { useWedding } from "@/context/WeddingContext";

interface WeddingBottomProps {
  playing: boolean;
  setPlaying: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  currentTrack: number;
  setCurrentTrack: (v: number) => void;
  lightbox: string | null;
  setLightbox: (v: string | null) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onUnlock: () => void;
  musicUnlocked: boolean;
}

export default function WeddingBottom({
  playing, setPlaying, volume, setVolume,
  currentTrack, setCurrentTrack, lightbox, setLightbox,
  audioRef, onUnlock, musicUnlocked,
}: WeddingBottomProps) {
  const { data } = useWedding();

  const weddingYear = new Date(data.weddingDate).getFullYear();
  const weddingMonth = new Date(data.weddingDate).toLocaleString("ru-RU", { month: "long" });

  return (
    <>
      {/* MAP */}
      <section id="map" className="py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-5xl mx-auto">
          <Fade><SectionTitle title="Карта" sub="Как добраться" /></Fade>
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
            {[
              { icon: "Car", title: data.mapCarTitle, text: data.mapCarText },
              { icon: "Train", title: data.mapTrainTitle, text: data.mapTrainText },
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
                src={`https://yandex.ru/map-widget/v1/?ll=${data.mapLng}%2C${data.mapLat}&z=15&pt=${data.mapLng},${data.mapLat},pm2rdm&lang=ru_RU`}
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
            {data.audioUrl ? (
              <>
                <div className="rounded-sm border border-white/10 p-8 bg-[#4A4035]/50">
                  <div className="flex items-center gap-4 mb-7">
                    <div className="w-16 h-16 rounded-sm bg-[#B8976A]/20 flex items-center justify-center shrink-0">
                      <Icon name="Music" size={22} className="text-[#B8976A]" />
                    </div>
                    <div>
                      <p className="font-cormorant text-xl text-white">{data.audioName || "Ваш трек"}</p>
                      <p className="text-xs text-white/40 font-montserrat mt-0.5">Музыкальное сопровождение</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-7 mb-6">
                    <button
                      onClick={() => {
                        if (!musicUnlocked) { onUnlock(); return; }
                        setPlaying(!playing);
                      }}
                      className="w-14 h-14 rounded-full bg-[#B8976A] flex items-center justify-center hover:bg-[#C9897A] transition-colors">
                      <Icon name={playing ? "Pause" : "Play"} size={22} className="text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Volume2" size={14} className="text-white/35" />
                    <input type="range" className="progress-bar flex-1" value={volume} onChange={(e) => setVolume(+e.target.value)} />
                    <span className="text-[10px] text-white/35 font-montserrat w-5">{volume}</span>
                  </div>
                </div>
                {playing && (
                  <div className="flex gap-1 items-end justify-center h-8 mt-6">
                    {[3, 5, 2, 7, 4, 6, 3].map((h, j) => (
                      <div key={j} className="w-1 bg-[#B8976A] rounded animate-bounce" style={{ height: `${h * 4}px`, animationDelay: `${j * 0.1}s` }} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
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
                  <p className="text-center text-xs text-white/35 font-montserrat mb-6 leading-relaxed">
                    Загрузите свой трек в панели управления<br />раздел «Музыка»
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center opacity-40 cursor-not-allowed">
                      <Icon name="Play" size={22} className="text-white" />
                    </div>
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
                    </button>
                  ))}
                </div>
              </>
            )}
          </Fade>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-24 px-6 bg-[#FAF7F2]">
        <div className="max-w-5xl mx-auto">
          <Fade><SectionTitle title="Галерея" sub="Наши моменты" /></Fade>
          <Fade delay={100}>
            {(data.galleryPhotos && data.galleryPhotos.length > 0) ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.galleryPhotos.map((url, i) => (
                  <div key={i} onClick={() => setLightbox(url)}
                    className="aspect-square overflow-hidden cursor-pointer group relative rounded-sm">
                    <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[#3D2B1F]/0 group-hover:bg-[#3D2B1F]/25 transition-all duration-300 flex items-center justify-center">
                      <Icon name="ZoomIn" size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
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
              { icon: "Phone", title: data.groomName, sub: "Жених", val: data.contactGroom },
              { icon: "Phone", title: data.brideName, sub: "Невеста", val: data.contactBride },
              { icon: "Users", title: "Ведущая Алина", sub: "По вопросам программы", val: data.contactHost },
              { icon: "Mail", title: "Email", sub: "Общие вопросы", val: data.contactEmail },
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
                {data.footerTitle}
              </h2>
              <p className="text-sm text-[#9B8878] font-montserrat italic">{data.footerSub}, {data.groomName} & {data.brideName}</p>
              <p className="text-[10px] tracking-[0.5em] text-[#B8976A] font-montserrat uppercase mt-7">{weddingYear} · {weddingMonth}</p>
            </div>
          </Fade>
        </div>
      </section>
    </>
  );
}