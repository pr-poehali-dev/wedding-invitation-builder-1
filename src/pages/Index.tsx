import { useState, useEffect, useRef } from "react";
import { Petals, TEMPLATES, FONTS, TRACKS } from "@/components/wedding/wedding-shared";
import WeddingTop from "@/components/wedding/WeddingTop";
import WeddingMiddle from "@/components/wedding/WeddingMiddle";
import WeddingBottom from "@/components/wedding/WeddingBottom";
import Icon from "@/components/ui/icon";
import { useWedding } from "@/context/WeddingContext";

export default function Index() {
  const { data } = useWedding();
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
  const [musicUnlocked, setMusicUnlocked] = useState(false);
  const [showMusicBanner, setShowMusicBanner] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const wedding = new Date(data.weddingDate);

  // Countdown
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
  }, [data.weddingDate]);

  // Update audio src when custom track changes
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const wasPl = !audio.paused;
    if (data.audioUrl) {
      audio.src = data.audioUrl;
    } else {
      audio.src = "";
    }
    if (wasPl && data.audioUrl) audio.play().catch(() => {});
  }, [data.audioUrl]);

  // Audio setup — tries autoplay, shows banner if blocked
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume / 100;
    if (data.audioUrl) audio.src = data.audioUrl;
    audioRef.current = audio;

    const tryAutoplay = async () => {
      if (!audio.src) {
        setShowMusicBanner(false);
        return;
      }
      try {
        await audio.play();
        setPlaying(true);
        setMusicUnlocked(true);
      } catch {
        setShowMusicBanner(true);
      }
    };

    const timer = setTimeout(tryAutoplay, 1500);
    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Sync playing state
  useEffect(() => {
    if (!audioRef.current || !musicUnlocked) return;
    if (playing) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing, musicUnlocked]);

  const handleUnlockMusic = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.play().then(() => {
      setPlaying(true);
      setMusicUnlocked(true);
      setShowMusicBanner(false);
    }).catch(() => {});
  };

  // Track name to show in player
  const currentTrackLabel = data.audioUrl
    ? (data.audioName || "Ваш трек")
    : TRACKS[currentTrack].title;

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(id);
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative overflow-x-hidden">
      <Petals />

      {/* Music unlock banner */}
      {showMusicBanner && !musicUnlocked && data.audioUrl && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-[#3D2B1F] text-white px-5 py-3.5 rounded-sm shadow-2xl flex items-center gap-3 font-montserrat">
            <Icon name="Music" size={16} className="text-[#B8976A] shrink-0" />
            <span className="text-xs tracking-wide flex-1">Включить музыкальное сопровождение?</span>
            <button
              onClick={handleUnlockMusic}
              className="bg-[#B8976A] hover:bg-[#C9897A] text-white text-[10px] tracking-widest uppercase px-4 py-2 rounded-sm transition-colors whitespace-nowrap shrink-0"
            >
              Включить
            </button>
            <button onClick={() => setShowMusicBanner(false)} className="text-white/40 hover:text-white transition-colors shrink-0">
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating music player — only if audio is loaded */}
      {musicUnlocked && data.audioUrl && (
        <div className="fixed bottom-5 right-5 z-40">
          <div className="bg-[#3D2B1F]/95 backdrop-blur-sm rounded-sm border border-white/10 px-4 py-3 flex items-center gap-3 shadow-2xl">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-white/40 font-montserrat uppercase tracking-widest">Сейчас играет</span>
              <span className="text-xs text-white/80 font-montserrat truncate max-w-[140px]">{currentTrackLabel}</span>
            </div>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-8 h-8 rounded-full bg-[#B8976A] hover:bg-[#C9897A] flex items-center justify-center transition-colors shrink-0"
            >
              <Icon name={playing ? "Pause" : "Play"} size={14} className="text-white" />
            </button>
            {playing && (
              <div className="flex gap-0.5 items-end h-4 shrink-0">
                {[2, 4, 3, 5, 2].map((h, j) => (
                  <div key={j} className="w-0.5 bg-[#B8976A] rounded animate-bounce" style={{ height: `${h * 3}px`, animationDelay: `${j * 0.12}s` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <WeddingTop
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        activeNav={activeNav}
        cd={cd}
        go={go}
      />
      <WeddingMiddle
        tmpl={tmpl} setTmpl={setTmpl}
        font={font} setFont={setFont}
        inviteText={inviteText} setInviteText={setInviteText}
        rsvpName={rsvpName} setRsvpName={setRsvpName}
        rsvpEmail={rsvpEmail} setRsvpEmail={setRsvpEmail}
        rsvpStatus={rsvpStatus} setRsvpStatus={setRsvpStatus}
        rsvpDone={rsvpDone} setRsvpDone={setRsvpDone}
        answers={answers} setAnswers={setAnswers}
        surveyDone={surveyDone} setSurveyDone={setSurveyDone}
      />
      <WeddingBottom
        playing={playing} setPlaying={setPlaying}
        volume={volume} setVolume={setVolume}
        currentTrack={currentTrack} setCurrentTrack={setCurrentTrack}
        lightbox={lightbox} setLightbox={setLightbox}
        audioRef={audioRef}
        onUnlock={handleUnlockMusic}
        musicUnlocked={musicUnlocked}
      />
    </div>
  );
}