import { useState, useEffect } from "react";

export default function CookiesBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies_accepted");
    if (!accepted) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = (type: "all" | "necessary") => {
    localStorage.setItem("cookies_accepted", type);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center p-4 animate-fadeIn print:hidden">
      <div className="w-full max-w-4xl bg-[#FAF9F6] border-l-4 border-l-[#D4A373] border border-[#E5E5E1] rounded-2xl shadow-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-left space-y-1">
          <p className="text-xs md:text-sm font-serif font-black text-slate-800">
            Używamy plików cookies 🍪
          </p>
          <p className="text-[11px] md:text-xs text-[#9A9A92] font-medium leading-relaxed max-w-[650px] font-sans">
            Używamy cookies do analityki i remarketingu (Meta Pixel). Czy wyrażasz zgodę? Szczegółowe informacje znajdziesz w naszej{" "}
            <a href="/regulamin" target="_blank" rel="noopener noreferrer" className="text-[#D4A373] hover:underline font-bold">Polityce Prywatności</a>.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => handleAccept("necessary")}
            className="flex-1 md:flex-initial px-4 py-2 bg-white border border-[#E5E5E1] hover:border-slate-350 text-[#2D3142] text-[11px] font-bold rounded-full transition-all cursor-pointer font-sans"
          >
            Tylko niezbędne
          </button>
          <button
            type="button"
            onClick={() => handleAccept("all")}
            className="flex-1 md:flex-initial px-5 py-2 bg-[#1A1C23] hover:bg-black text-white text-[11px] font-bold rounded-full transition-all cursor-pointer font-sans shadow-md"
          >
            Akceptuję wszystkie
          </button>
        </div>
      </div>
    </div>
  );
}
