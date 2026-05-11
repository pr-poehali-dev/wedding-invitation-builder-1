import { useState, useEffect } from "react";
import { Petals, FONTS, TEMPLATES } from "@/components/wedding/wedding-shared";
import WeddingTop from "@/components/wedding/WeddingTop";
import WeddingMiddle from "@/components/wedding/WeddingMiddle";
import WeddingBottom from "@/components/wedding/WeddingBottom";

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

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(id);
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative overflow-x-hidden">
      <Petals />
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
      />
    </div>
  );
}
