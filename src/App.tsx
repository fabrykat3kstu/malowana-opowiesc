import { useState, useEffect } from "react";
import {
  Baby, Sparkles, Rocket, TreePine, Fish, Castle,
  Heart, Shield, Wand2, ChevronRight,
  ChevronLeft, Coins, Printer, ArrowLeft, Paintbrush, AlertCircle,
  Star, Droplets, Map, BookOpen, Flame, Feather, Lock, Check, X, ShieldCheck
} from "lucide-react";
import StripeCheckoutSimulator from "./components/StripeCheckoutSimulator";
import { ARCHETYPES, WORLDS, MORALS } from "./data";
import { ChildPreferences, StoryBook } from "./types";

export interface SavedStory {
  id: string;
  story: StoryBook;
  preferences: ChildPreferences;
  imagesMap: Record<number, string>;
  unlockedPages: Record<number, boolean>;
  seed: number;
  timestamp: number;
}

export default function App() {
  const [step, setStep] = useState<number>(-1); // Start at dashboard step === -1
  const [credits, setCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
  
  const [preferences, setPreferences] = useState<ChildPreferences>({
    childName: "",
    childGender: "girl",
    childAge: 5,
    archetype: ARCHETYPES[0].id,
    world: WORLDS[0].id,
    moral: MORALS[0].id
  });

  const [story, setStory] = useState<StoryBook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  const [, setIsGeneratingStory] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [hudMessage, setHudMessage] = useState<string>("");
  const [showStripeModal, setShowStripeModal] = useState<boolean>(false);
  
  // 2.0 states
  const [unlockedPages, setUnlockedPages] = useState<Record<number, boolean>>({});
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [showHistoryList, setShowHistoryList] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(0);

  const [savedStories, setSavedStories] = useState<SavedStory[]>(() => {
    try {
      const local = localStorage.getItem("malowana_opowiesc_stories");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [imagesMap, setImagesMap] = useState<Record<number, string>>({});
  const [loadingImagesMap, setLoadingImagesMap] = useState<Record<number, boolean>>({});
  const [imageErrorsMap, setImageErrorsMap] = useState<Record<number, string>>({});

  const unlockedCount = story ? story.pages.filter((_, idx) => !!unlockedPages[idx]).length : 0;
  const loadedImagesCount = story ? story.pages.filter((_, idx) => !!unlockedPages[idx] && !!imagesMap[idx]).length : 0;
  const isAllImagesLoaded = story ? loadedImagesCount === unlockedCount : false;

  const loadSavedStory = (saved: SavedStory) => {
    setStory(saved.story);
    setPreferences(saved.preferences);
    setImagesMap(saved.imagesMap);
    setSeed(saved.seed || Math.floor(Math.random() * 1000000));
    
    const allUnlocked: Record<number, boolean> = {};
    if (saved.unlockedPages && Object.keys(saved.unlockedPages).length > 1) {
      for (let i = 0; i < 15; i++) {
        allUnlocked[i] = true;
      }
    } else {
      allUnlocked[0] = true;
    }
    setUnlockedPages(allUnlocked);
    setActiveStoryId(saved.id);
    setCurrentPageIndex(0);
    setStep(5);
  };

  const saveOrUpdateStory = (
    storyId: string,
    storyObj: StoryBook,
    prefs: ChildPreferences,
    imgMap: Record<number, string>,
    unlocked: Record<number, boolean>,
    storySeed?: number
  ) => {
    setSavedStories(prev => {
      const idx = prev.findIndex(s => s.id === storyId);
      const targetSeed = storySeed !== undefined ? storySeed : (idx !== -1 ? (prev[idx].seed || seed) : seed);
      let updated;
      if (idx !== -1) {
        updated = prev.map(s => s.id === storyId ? { ...s, story: storyObj, preferences: prefs, imagesMap: imgMap, unlockedPages: unlocked, seed: targetSeed } : s);
      } else {
        const newStory: SavedStory = {
          id: storyId,
          story: storyObj,
          preferences: prefs,
          imagesMap: imgMap,
          unlockedPages: unlocked,
          seed: targetSeed,
          timestamp: Date.now()
        };
        updated = [newStory, ...prev];
      }
      localStorage.setItem("malowana_opowiesc_stories", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchCredits = async () => {
    try {
      setLoadingCredits(true);
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCredits(false);
    }
  };

  useEffect(() => {
    fetchCredits();

    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get("payment");
    const pack = urlParams.get("package");

    if (payment === "success" && pack) {
      let creditsToAdd = 3;
      if (pack === "1_story") creditsToAdd = 1;
      else if (pack === "3_stories") creditsToAdd = 3;
      else if (pack === "6_stories") creditsToAdd = 6;
      else if (pack === "12_stories") creditsToAdd = 12;

      const credsSuccess = async () => {
        try {
          const res = await fetch("/api/credits/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: creditsToAdd })
          });
          if (res.ok) {
            const data = await res.json();
            setCredits(data.credits);
            showToast("Płatność udana! Twoje bajki zostały odblokowane 🌟");
            
            const stories = localStorage.getItem("malowana_opowiesc_stories");
            if (stories) {
              const parsedStories = JSON.parse(stories);
              if (parsedStories.length > 0) {
                const consumeRes = await fetch("/api/credits/consume", { method: "POST" });
                if (consumeRes.ok) {
                  const consumeData = await consumeRes.json();
                  setCredits(consumeData.credits);
                  
                  const allUnlocked: Record<number, boolean> = {};
                  for (let i = 0; i < 15; i++) {
                    allUnlocked[i] = true;
                  }
                  
                  const latestStory = parsedStories[0];
                  latestStory.unlockedPages = allUnlocked;
                  localStorage.setItem("malowana_opowiesc_stories", JSON.stringify(parsedStories));
                  setSavedStories(parsedStories);

                  // Załaduj bajkę do widoku czytnika
                  setStory(latestStory.story);
                  setPreferences(latestStory.preferences);
                  setImagesMap(latestStory.imagesMap);
                  setSeed(latestStory.seed || 0);
                  setUnlockedPages(allUnlocked);
                  setActiveStoryId(latestStory.id);
                  setCurrentPageIndex(0);
                  setStep(5);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error confirming payment:", error);
        }
      };

      credsSuccess();

      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
    } else if (payment === "cancelled") {
      showToast("Płatność została anulowana.");
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
    }
  }, []);

  const showToast = (message: string) => {
    setHudMessage(message);
    setTimeout(() => setHudMessage(""), 4500);
  };

  const handleGenerateStory = async () => {
    if (!preferences.childName.trim()) {
      setErrorMsg("Proszę wpisać imię dziecka.");
      setStep(1);
      return;
    }

    setErrorMsg("");
    setIsGeneratingStory(true);
    setStep(0);
    setUnlockedPages({ 0: true });

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || "Błąd układania bajki.");
      }

      const generatedStory = await response.json();
      setStory(generatedStory);
      setImagesMap({});
      setLoadingImagesMap({});
      setImageErrorsMap({});
      setUnlockedPages({ 0: true });
      setCurrentPageIndex(0);
      
      const newId = Date.now().toString();
      setActiveStoryId(newId);
      
      const newSeed = Math.floor(Math.random() * 1000000);
      setSeed(newSeed);
      
      // Zapisz nowo utworzoną bajkę w historii z odblokowaną stroną 1 (index 0) i z nowym ziarnem
      saveOrUpdateStory(newId, generatedStory, preferences, {}, { 0: true }, newSeed);
      
      setStep(5);
      showToast("Bajka ułożona przez Zaczarowanego pisarza!");
      triggerImageRender(0, generatedStory.pages[0].image_prompt, newSeed);

    } catch (err: any) {
      setErrorMsg(err.message || "Błąd układania bajki.");
      setStep(4);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const triggerImageRender = async (pageIdx: number, promptText: string, targetSeed?: number) => {
    if (imagesMap[pageIdx] || loadingImagesMap[pageIdx]) return;

    setLoadingImagesMap(prev => ({ ...prev, [pageIdx]: true }));
    setImageErrorsMap(prev => ({ ...prev, [pageIdx]: "" }));

    const activeSeed = targetSeed !== undefined ? targetSeed : seed;

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, seed: activeSeed })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Błąd podczas rysowania ilustracji.");
      }

      const data = await response.json();
      if (data.output) {
        setImagesMap(prev => {
          const updated = { ...prev, [pageIdx]: data.output };
          // Persist to localStorage/history
          if (activeStoryId && story) {
            saveOrUpdateStory(activeStoryId, story, preferences, updated, unlockedPages, activeSeed);
          }
          return updated;
        });
      } else {
        throw new Error("Niepoprawny format danych ilustracji.");
      }
    } catch (e: any) {
      console.error(e);
      setImageErrorsMap(prev => ({ ...prev, [pageIdx]: e.message || "Problem z rysowaniem ilustracji." }));
    } finally {
      setLoadingImagesMap(prev => ({ ...prev, [pageIdx]: false }));
    }
  };

  // Efekt automatycznego sekwencyjnego pobierania odblokowanych ilustracji w tle
  useEffect(() => {
    if (step !== 5 || !story) return;

    // Sprawdź czy jakikolwiek obrazek jest obecnie pobierany
    const isAnyLoading = Object.values(loadingImagesMap).some(v => v === true);
    if (isAnyLoading) return;

    let nextIndex = -1;

    // 1. Priorytet: Sprawdź czy bieżąca oglądana strona potrzebuje ilustracji i jest odblokowana
    if (unlockedPages[currentPageIndex] && !imagesMap[currentPageIndex] && !imageErrorsMap[currentPageIndex] && !loadingImagesMap[currentPageIndex]) {
      nextIndex = currentPageIndex;
    } else {
      // 2. Kolejka: Znajdź pierwszą inną odblokowaną stronę bez ilustracji
      nextIndex = story.pages.findIndex(
        (_, idx) => unlockedPages[idx] && !imagesMap[idx] && !imageErrorsMap[idx] && !loadingImagesMap[idx]
      );
    }

    if (nextIndex !== -1) {
      const timer = setTimeout(() => {
        triggerImageRender(nextIndex, story.pages[nextIndex].image_prompt, seed);
      }, 500); // 500ms odstępu
      return () => clearTimeout(timer);
    }
  }, [step, story, currentPageIndex, imagesMap, loadingImagesMap, imageErrorsMap, unlockedPages]);

  const handleUnlockBookAndNavigate = async (targetIdx?: number) => {
    if (credits < 1) {
      setShowStripeModal(true);
      return;
    }

    try {
      const res = await fetch("/api/credits/consume", { method: "POST" });
      if (!res.ok) {
        throw new Error("Brak dostępnych bajek.");
      }
      const data = await res.json();
      setCredits(data.credits);
      
      // Odblokuj wszystkie strony od 0 do 14 (1 do 15)
      const allUnlocked: Record<number, boolean> = {};
      for (let i = 0; i < 15; i++) {
        allUnlocked[i] = true;
      }
      setUnlockedPages(allUnlocked);
      
      // Zapisz zaktualizowany stan w historii
      if (activeStoryId && story) {
        saveOrUpdateStory(activeStoryId, story, preferences, imagesMap, allUnlocked);
      }
      
      if (targetIdx !== undefined) {
        setCurrentPageIndex(targetIdx);
      }
      showToast("Wszystkie kolorowanki zostały odblokowane!");
    } catch (e: any) {
      showToast(e.message || "Błąd podczas odblokowywania kolorowanek.");
    }
  };

  const handleStripeSuccess = async (creditsAdded: number) => {
    try {
      const res = await fetch("/api/credits/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: creditsAdded })
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
        showToast(`Dodano pomyślnie ${creditsAdded} ${creditsAdded === 1 ? "bajkę" : [2, 3, 4].includes(creditsAdded % 10) && ![12, 13, 14].includes(creditsAdded) ? "bajki" : "bajek"}!`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setShowStripeModal(false);
    }
  };

  const getCoverTheme = () => {
    switch (preferences.world) {
      case "Kosmiczna Stacja":
        return {
          bg: "from-[#0F172A] via-[#1E1B4B] to-[#311042] border-indigo-500/25",
          accent: "bg-indigo-500/10 text-indigo-300",
          text: "text-slate-100",
          shadow: "shadow-indigo-900/30",
          icon: <Rocket className="w-12 h-12 text-[#D4A373]" />
        };
      case "Tajemniczy Las":
        return {
          bg: "from-[#064E3B] via-[#065F46] to-[#022C22] border-emerald-500/25",
          accent: "bg-emerald-500/10 text-emerald-300",
          text: "text-[#FAF9F6]",
          shadow: "shadow-emerald-950/30",
          icon: <TreePine className="w-12 h-12 text-[#A7F3D0]" />
        };
      case "Podwodny Pałac":
        return {
          bg: "from-[#0C4A6E] via-[#0369A1] to-[#075985] border-sky-500/25",
          accent: "bg-sky-500/10 text-sky-300",
          text: "text-[#FAF9F6]",
          shadow: "shadow-sky-950/30",
          icon: <Fish className="w-12 h-12 text-[#38BDF8]" />
        };
      case "Zaginiona Wyspa":
        return {
          bg: "from-[#78350F] via-[#92400E] to-[#451A03] border-amber-500/25",
          accent: "bg-amber-500/10 text-amber-300",
          text: "text-[#FAF9F6]",
          shadow: "shadow-amber-950/30",
          icon: <Map className="w-12 h-12 text-[#FDE047]" />
        };
      case "Zamek w Chmurach":
        return {
          bg: "from-[#4C1D95] via-[#6D28D9] to-[#2E1065] border-fuchsia-500/25",
          accent: "bg-fuchsia-500/10 text-fuchsia-300",
          text: "text-[#FAF9F6]",
          shadow: "shadow-fuchsia-950/30",
          icon: <Castle className="w-12 h-12 text-[#F472B6]" />
        };
      default:
        return {
          bg: "from-[#1A1C23] via-[#2D3142] to-[#12131A] border-[#D4A373]/25",
          accent: "bg-[#D4A373]/10 text-[#D4A373]",
          text: "text-slate-100",
          shadow: "shadow-black/30",
          icon: <Sparkles className="w-12 h-12 text-[#D4A373]" />
        };
    }
  };

  const getDynamicTitle = () => {
    const name = preferences.childName.trim();
    if (!name) return "Magiczna Opowieść";
    
    const titleSuffix = preferences.childGender === "boy" ? "dzielnego" : "dzielnej";
    
    switch (preferences.world) {
      case "Kosmiczna Stacja":
        return `Kosmiczne Loty ${titleSuffix}ego ${preferences.archetype.toLowerCase()} ${name}`;
      case "Tajemniczy Las":
        return `Tajemnica Lasu i ${preferences.archetype} ${name}`;
      case "Podwodny Pałac":
        return `Koralowy Pałac i ${preferences.archetype} ${name}`;
      case "Zaginiona Wyspa":
        return `Zaginiona Wyspa i Wielka Przygoda ${name}`;
      case "Zamek w Chmurach":
        return `Podniebny Zamek i ${preferences.archetype} ${name}`;
      default:
        return `Niezwykłe Przygody ${name}`;
    }
  };

  const getArchetypeIcon = (id: string) => {
    switch (id) {
      case "Astronauta": return <Rocket className="w-5 h-5" />;
      case "Dzielny Rycerz": return <Shield className="w-5 h-5" />;
      case "Dinozaur": return <Baby className="w-5 h-5" />;
      case "Syrenka": return <Fish className="w-5 h-5" />;
      case "Młody Czarodziej": return <Wand2 className="w-5 h-5" />;
      case "Strażak": return <Flame className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getWorldIcon = (id: string) => {
    switch (id) {
      case "Kosmiczna Stacja": return <Star className="w-5 h-5" />;
      case "Tajemniczy Las": return <TreePine className="w-5 h-5" />;
      case "Podwodny Pałac": return <Droplets className="w-5 h-5" />;
      case "Zaginiona Wyspa": return <Map className="w-5 h-5" />;
      case "Zamek w Chmurach": return <Castle className="w-5 h-5" />;
      default: return <TreePine className="w-5 h-5" />;
    }
  };

  const getMoralIcon = (id: string) => {
    switch (id) {
      case "O dzieleniu się z innymi": return <Heart className="w-4 h-4" />;
      case "O pokonywaniu strachu": return <Shield className="w-4 h-4" />;
      case "O sile prawdziwej przyjaźni": return <BookOpen className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div id="app-root" className="min-h-screen w-full bg-[#FAF9F6] text-[#2D3142] font-sans flex flex-col overflow-x-hidden relative">
      
      {hudMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1C23] text-white px-5 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold tracking-wide flex items-center gap-2 animate-fadeIn print:hidden">
          <Sparkles className="text-[#D4A373] animate-pulse w-4 h-4" />
          <span>{hudMessage}</span>
        </div>
      )}

      <header className="h-20 bg-white border-b border-[#E5E5E1] px-6 md:px-12 flex items-center justify-between flex-shrink-0 relative z-30 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4A373] rounded-xl flex items-center justify-center shadow-sm">
            <Paintbrush className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-serif font-black tracking-tight text-[#1A1C23]">Malowana Opowieść</h1>
            <p className="hidden md:block text-[10px] text-[#9A9A92] uppercase tracking-[0.15em] font-bold">Personalizator Bajek & Kolorowanek z Zaczarowanym pisarzem</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-[#9A9A92] font-extrabold font-serif">Twoje bajki</span>
            {loadingCredits ? (
              <span className="text-xs text-slate-400 font-mono">Ładowanie...</span>
            ) : (
              <span className="text-sm md:text-base font-mono font-bold text-[#1A1C23] bg-[#F2F1EC] px-3 py-1 rounded-lg">
                {credits} {credits === 1 ? "bajka" : [2, 3, 4].includes(credits) ? "bajki" : "bajek"}
              </span>
            )}
          </div>
          <button 
            type="button"
            onClick={() => setShowStripeModal(true)} 
            className="px-4 py-2 bg-[#1A1C23] text-white text-xs font-medium rounded-full hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-[#D4A373]" /> Kup bajki
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row h-full relative z-10 overflow-hidden print:hidden">
        
        {step > 0 && step < 5 && (
          <aside className="w-full md:w-[360px] bg-white border-b md:border-b-0 md:border-r border-[#E5E5E1] p-6 md:p-8 flex flex-col justify-between gap-6 overflow-y-auto print:hidden">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#9A9A92] font-serif">Kreator Personalizacji</span>
                <span className="text-xs font-bold font-mono text-[#D4A373]">{step} z 4</span>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="shrink-0 w-4 h-4 text-red-500 mt-0.5" />
                  <p className="font-medium">{errorMsg}</p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Imię bohatera bajki</label>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="Napisz imię np. Zosia, Kacperek..."
                      value={preferences.childName}
                      onChange={(e) => {
                        setPreferences({ ...preferences, childName: e.target.value });
                        setErrorMsg("");
                      }}
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E5E1] focus:border-[#D4A373] rounded-xl text-sm outline-none transition-all font-sans"
                    />
                    {errorMsg && errorMsg.includes("imię") && (
                      <p className="text-[10px] text-rose-500 font-bold mt-1.5 font-sans">
                        ⚠️ Wpisz poprawne imię dziecka (min. 2 litery)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Płeć dziecka</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPreferences({ ...preferences, childGender: "girl" })}
                        className={`py-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                          preferences.childGender === "girl"
                            ? "border-[#D4A373] bg-[#FAF9F6] text-[#2D3142]"
                            : "border-slate-100 bg-white text-slate-400 opacity-60"
                        }`}
                      >
                        Dziewczynka
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreferences({ ...preferences, childGender: "boy" })}
                        className={`py-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                          preferences.childGender === "boy"
                            ? "border-[#D4A373] bg-[#FAF9F6] text-[#2D3142]"
                            : "border-slate-100 bg-white text-slate-400 opacity-60"
                        }`}
                      >
                        Chłopiec
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Wiek dziecka</label>
                      <span className="font-serif font-bold text-[#D4A373] text-sm">{preferences.childAge} lat</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      step={1}
                      value={preferences.childAge}
                      onChange={(e) => setPreferences({ ...preferences, childAge: parseInt(e.target.value) })}
                      className="w-full accent-[#D4A373] h-1 bg-[#E5E5E1]"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Postać biorąca udział w bajce</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {ARCHETYPES.map((arch) => (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => setPreferences({ ...preferences, archetype: arch.id })}
                        className={`p-3 border-2 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                          preferences.archetype === arch.id
                            ? "border-[#D4A373] bg-[#FAF9F6]"
                            : "border-transparent bg-[#FAF9F6]/60"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${preferences.archetype === arch.id ? "bg-[#D4A373] text-white" : "bg-white text-slate-400"}`}>
                          {getArchetypeIcon(arch.id)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs">{arch.label}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{arch.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Wybierz magiczną krainę</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {WORLDS.map((wld) => (
                      <button
                        key={wld.id}
                        type="button"
                        onClick={() => setPreferences({ ...preferences, world: wld.id })}
                        className={`p-3 border-2 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                          preferences.world === wld.id
                            ? "border-[#D4A373] bg-[#FAF9F6]"
                            : "border-transparent bg-[#FAF9F6]/60"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${preferences.world === wld.id ? "bg-[#D4A373] text-white" : "bg-white text-slate-400"}`}>
                          {getWorldIcon(wld.id)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs">{wld.label}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{wld.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Nauka moralna płynąca z bajki</label>
                  <div className="space-y-2">
                    {MORALS.map((moral) => (
                      <button
                        key={moral.id}
                        type="button"
                        onClick={() => setPreferences({ ...preferences, moral: moral.id })}
                        className={`w-full p-4 border-2 rounded-xl flex flex-col items-start text-left transition-all cursor-pointer ${
                          preferences.moral === moral.id
                            ? "border-[#D4A373] bg-[#FAF9F6]"
                            : "border-transparent bg-[#FAF9F6]/60"
                        }`}
                      >
                        <span className="font-bold text-xs flex items-center gap-1.5 mb-1">
                          {getMoralIcon(moral.id)} {moral.label}
                        </span>
                        <p className="text-[10px] text-slate-400">{moral.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="pt-4 border-t border-[#E5E5E1] flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-3 bg-white border border-[#E5E5E1] text-xs font-semibold rounded-xl text-[#2D3142] cursor-pointer"
                >
                  Cofnij
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      const regex = /^[a-zA-ZąęćłńóśźżĄĘĆŁŃÓŚŹŻ\s-]+$/;
                      const trimmed = preferences.childName.trim();
                      if (trimmed.length < 2 || !regex.test(trimmed)) {
                        setErrorMsg("Wpisz poprawne imię dziecka (min. 2 litery)");
                        return;
                      }
                    }
                    setErrorMsg("");
                    setStep(step + 1);
                  }}
                  className="flex-1 py-3 bg-[#1A1C23] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Dalej <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateStory}
                  className="flex-1 py-3.5 bg-[#6B705C] hover:bg-[#585c4b] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Stwórz magiczną bajkę
                </button>
              )}
            </div>
          </aside>
        )}

        <section className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center bg-[#F2F1EC] relative overflow-y-auto print:bg-white print:p-0 print:overflow-visible">
          
          {step === -1 && (
            <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[#E5E5E1] text-center space-y-8 animate-fadeIn print:hidden">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-[#D4A373]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4A373]/20">
                  <Paintbrush className="text-[#D4A373] w-8 h-8" />
                </div>
                <h2 className="font-serif text-3xl font-black text-[#1A1C23] leading-tight">
                  Dzień dobry! Dla kogo dzisiaj układamy bajkę?
                </h2>
                <p className="text-sm text-slate-400 font-medium font-sans">
                  Stwórz spersonalizowaną opowieść o wybranej krainie, z morałem i unikalnymi kolorowankami.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg("");
                  }}
                  className="p-6 bg-[#6B705C] hover:bg-[#585c4b] text-white rounded-2xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
                >
                  <Sparkles className="w-8 h-8 text-[#D4A373] group-hover:animate-pulse" />
                  <div>
                    <span className="block font-bold text-sm">+ Stwórz nową bajkę</span>
                    <span className="block text-[10px] opacity-75 mt-0.5 font-medium">5-stronicowa przygoda gratis</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHistoryList(prev => !prev)}
                  className={`p-6 border-2 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    showHistoryList 
                      ? "border-[#D4A373] bg-[#FAF9F6] text-[#2D3142]" 
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <BookOpen className="w-8 h-8 text-slate-400" />
                  <div>
                    <span className="block font-bold text-sm">Moje poprzednie bajki</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                      Zapisane: {savedStories.length}
                    </span>
                  </div>
                </button>
              </div>

              {showHistoryList && (
                <div className="border-t border-[#E5E5E1] pt-6 text-left max-w-xl mx-auto space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-serif font-extrabold uppercase tracking-widest text-[#9A9A92]">
                    Twoje dotychczasowe bajki:
                  </h3>
                  
                  {savedStories.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed font-sans">
                      Nie masz jeszcze żadnych ułożonych bajek. Kliknij "+ Stwórz nową bajkę", aby zacząć!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                      {savedStories.map((saved) => {
                        const unlockedCount = Object.keys(saved.unlockedPages).length;
                        return (
                          <button
                            key={saved.id}
                            type="button"
                            onClick={() => {
                              setStory(saved.story);
                              setPreferences(saved.preferences);
                              setImagesMap(saved.imagesMap);
                              setUnlockedPages(saved.unlockedPages);
                              setActiveStoryId(saved.id);
                              setCurrentPageIndex(0);
                              setStep(5);
                            }}
                            className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#D4A373] text-left transition-all cursor-pointer hover:bg-white flex items-center justify-between gap-4 group"
                          >
                            <div className="space-y-1">
                              <span className="font-serif font-black text-xs text-slate-800 block group-hover:text-[#D4A373]">
                                {saved.story.title || `Bajka dla ${saved.preferences.childName}`}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-medium font-sans">
                                Bohater: {saved.preferences.childName} ({saved.preferences.archetype}) • Kraina: {saved.preferences.world}
                              </span>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold text-slate-500 bg-white border px-2.5 py-1 rounded-full group-hover:bg-[#FAF9F6] font-mono">
                              {unlockedCount} / 15 kolorowanek
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 0 && (
            <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-[#E5E5E1] text-center space-y-6 print:hidden">
              <style>{`
                @keyframes writingFeather {
                  0% { transform: translateX(0) translateY(0) rotate(0deg); }
                  25% { transform: translateX(60px) translateY(-4px) rotate(5deg); }
                  50% { transform: translateX(130px) translateY(4px) rotate(-5deg); }
                  75% { transform: translateX(190px) translateY(-2px) rotate(8deg); }
                  100% { transform: translateX(240px) translateY(0) rotate(0deg); }
                }
                @keyframes sparklePulse {
                  0%, 100% { opacity: 0.1; transform: scale(0.7); }
                  50% { opacity: 1; transform: scale(1.3); }
                }
                @keyframes bookFloat {
                  0%, 100% { transform: translateY(0); filter: drop-shadow(0 4px 6px rgba(212, 163, 115, 0.15)); }
                  50% { transform: translateY(-8px); filter: drop-shadow(0 12px 16px rgba(212, 163, 115, 0.35)); }
                }
                .animate-writing-feather {
                  animation: writingFeather 3.5s ease-in-out infinite alternate;
                }
                .animate-sparkle-1 { animation: sparklePulse 1.5s infinite 0.2s; }
                .animate-sparkle-2 { animation: sparklePulse 1.8s infinite 0.6s; }
                .animate-sparkle-3 { animation: sparklePulse 1.2s infinite 0.9s; }
                .animate-sparkle-4 { animation: sparklePulse 2s infinite 0.4s; }
                .animate-sparkle-5 { animation: sparklePulse 1.6s infinite 0.8s; }
                .animate-book-float {
                  animation: bookFloat 3s ease-in-out infinite;
                }
              `}</style>
              
              <div className="w-20 h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto border border-[#E5E5E1] shadow-inner relative animate-book-float">
                <BookOpen className="w-8 h-8 text-[#D4A373]" />
                <div className="absolute -top-1 -right-1 text-[#D4A373] animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-[#1A1C23]">Pióro bajkopisarza układa bajkę...</h3>
                <p className="text-xs text-[#9A9A92] leading-relaxed max-w-xs mx-auto font-sans">
                  Trwa układanie unikalnej linii fabularnej pod imię <strong>{preferences.childName}</strong>.
                </p>
              </div>

              <div className="relative w-[280px] h-12 mx-auto flex items-center justify-start overflow-visible border-b border-[#E5E5E1]/60">
                {/* Trail of sparkles */}
                <div className="absolute left-6 top-3 text-[#D4A373]/40 animate-sparkle-1"><Star size={8} fill="currentColor" /></div>
                <div className="absolute left-16 top-7 text-[#D4A373]/60 animate-sparkle-2"><Sparkles size={10} /></div>
                <div className="absolute left-28 top-2 text-[#D4A373]/30 animate-sparkle-3"><Star size={6} fill="currentColor" /></div>
                <div className="absolute left-40 top-8 text-[#D4A373]/80 animate-sparkle-4"><Sparkles size={12} /></div>
                <div className="absolute left-52 top-4 text-[#D4A373]/50 animate-sparkle-5"><Star size={8} fill="currentColor" /></div>
                <div className="absolute left-64 top-6 text-[#D4A373]/70 animate-sparkle-2"><Sparkles size={9} /></div>
                
                {/* Writing Feather */}
                <div className="absolute left-0 bottom-1.5 animate-writing-feather">
                  <div className="relative font-sans">
                    <Feather className="w-7 h-7 text-[#D4A373] -rotate-45 drop-shadow-[0_2px_4px_rgba(212,163,115,0.3)]" />
                    {/* Tiny trailing sparkle on the pen tip */}
                    <div className="absolute -bottom-1 -left-1 text-[#D4A373] animate-ping">
                      <Sparkles size={8} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step > 0 && step < 5 && (() => {
            const cover = getCoverTheme();
            const title = getDynamicTitle();
            return (
              <div className="flex flex-col items-center gap-6 w-full max-w-[400px] animate-fadeIn print:hidden">
                <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#9A9A92]">
                  Podgląd Twojej książki w czasie rzeczywistym:
                </span>
                
                {/* Wirtualna Okładka Książki */}
                <div 
                  className={`w-full aspect-[3/4] bg-gradient-to-br ${cover.bg} border rounded-r-2xl rounded-l-sm shadow-2xl relative overflow-hidden flex flex-col justify-between p-8 border-l-[10px] border-l-black/35 ${cover.shadow} transition-all duration-500 group hover:scale-[1.02] hover:shadow-3xl`}
                >
                  {/* Efekt połysku/światła na okładce (Glassmorphism & Gradient Highlight) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                  <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/20 pointer-events-none"></div>
                  
                  {/* Ozdobna Ramka (Decorative Border) */}
                  <div className="absolute inset-4 border border-white/15 rounded-r-xl rounded-l-xs pointer-events-none border-dashed"></div>
                  <div className="absolute inset-5 border border-white/5 rounded-r-lg rounded-l-xs pointer-events-none"></div>

                  {/* Góra Okładki */}
                  <div className="relative z-10 text-center">
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] uppercase tracking-[0.2em] font-extrabold text-white/90 border border-white/10 shadow-sm">
                      Spersonalizowana Magiczna Bajka
                    </span>
                  </div>

                  {/* Środek Okładki - Okrągły Emblemat/Ikona lub Miniatura */}
                  <div className="relative z-10 my-auto text-center flex flex-col items-center">
                    {imagesMap[0] ? (
                      <div className="w-24 h-24 bg-white border border-white/20 rounded-xl shadow-lg relative group-hover:scale-105 transition-transform duration-500 overflow-hidden flex items-center justify-center">
                        <img 
                          src={imagesMap[0]} 
                          alt="Miniatura pierwszej strony" 
                          className="w-full h-full object-cover" 
                          onError={() => {
                            setImagesMap(prev => {
                              const updated = { ...prev };
                              delete updated[0];
                              return updated;
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg relative group-hover:scale-110 transition-transform duration-500 backdrop-blur-xs">
                        {/* Ozdobne kręgi na zewnątrz */}
                        <div className="absolute -inset-1 border border-dashed border-[#D4A373]/30 rounded-full animate-[spin_40s_linear_infinite]"></div>
                        {cover.icon}
                      </div>
                    )}
                    
                    {/* dynamiczny tytuł */}
                    <h3 className={`mt-6 font-serif font-black text-lg tracking-tight text-center leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] px-4 ${cover.text}`}>
                      {title}
                    </h3>
                  </div>

                  {/* Dół Okładki */}
                  <div className="relative z-10 space-y-4">
                    <div className="text-center">
                      <span className="text-[10px] text-white/60 uppercase tracking-widest block mb-1.5 font-medium">Specjalnie dla:</span>
                      <div className="bg-white/15 backdrop-blur-md py-2 px-4 rounded-xl border border-white/10 shadow-inner w-full text-center">
                        <span className="font-serif text-sm font-black tracking-wide text-white drop-shadow-sm">
                          {preferences.childName.trim() || "Wpisz imię dziecka..."}
                        </span>
                      </div>
                    </div>
                    
                    {/* Etykiety z krainą i wiekiem */}
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-white/70 font-semibold px-1 font-mono">
                      <span>Wiek: {preferences.childAge} {preferences.childAge >= 5 ? "lat" : "lata"}</span>
                      <span>Kraina: {preferences.world}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#9A9A92] text-center max-w-[320px] leading-relaxed font-sans">
                  Uzupełnij konfigurację bajki. Po kliknięciu <strong className="text-slate-700">"Stwórz magiczną bajkę"</strong> Zaczarowany pisarz ułoży całą treść, a Ty odblokujesz wybrane kolorowanki do druku.
                </p>
              </div>
            );
          })()}

          {step === 5 && story && (
            <div className="flex flex-col items-center gap-6 w-full max-w-[500px] print:hidden">
              
              <div className="relative w-full bg-white rounded-sm shadow-2xl flex flex-col p-6 font-serif border-[12px] border-white outline outline-1 outline-[#E5E5E1]">
                
                <span className="absolute top-4 right-5 text-[10px] font-mono text-[#9A9A92]">
                  ROZDZIAŁ {currentPageIndex + 1} Z {story.pages.length}
                </span>

                <div className="w-full aspect-[3/4] border border-[#E5E5E1] rounded-lg bg-[#FAF9F6] flex flex-col items-center justify-center relative overflow-hidden group mb-6 mt-4">
                  {!unlockedPages[currentPageIndex] ? (
                    <div className="absolute inset-0 bg-slate-100/70 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
                      <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shadow-inner relative">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="space-y-1 font-sans">
                        <span className="block text-xs font-bold text-slate-700">
                          Ilustracja zablokowana
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Odblokuj kolorowankę (Zużyj 1 bajkę)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnlockBookAndNavigate(currentPageIndex)}
                        className="px-4 py-2 bg-[#6B705C] hover:bg-[#585c4b] text-white text-[10px] font-bold uppercase rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer font-sans"
                      >
                        Odblokuj kolorowankę
                      </button>
                    </div>
                  ) : loadingImagesMap[currentPageIndex] ? (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="w-10 h-10 border-4 border-[#D4A373] border-t-transparent rounded-full animate-spin"></div>
                      <span className="block text-[10px] text-[#9A9A92] leading-tight max-w-[200px] mx-auto font-sans">
                        Rysowanie ilustracji przez Zaczarowanego pisarza...
                      </span>
                    </div>
                  ) : imagesMap[currentPageIndex] ? (
                    <img
                      src={imagesMap[currentPageIndex]}
                      alt="Ilustracja Kolorowanki"
                      className="w-full h-full object-contain"
                      onError={() => {
                        setImagesMap(prev => {
                          const updated = { ...prev };
                          delete updated[currentPageIndex];
                          return updated;
                        });
                        setImageErrorsMap(prev => ({
                          ...prev,
                          [currentPageIndex]: "Ilustracja wygasła lub nie udało się jej pobrać. Kliknij przycisk poniżej, aby spróbować ponownie."
                        }));
                      }}
                    />
                  ) : (
                    <div className="p-6 text-center space-y-4 flex flex-col items-center animate-fadeIn font-sans">
                      <Paintbrush className="w-12 h-12 text-[#9A9A92] stroke-1" />
                      <div>
                        <span className="block text-xs font-serif font-bold text-[#1A1C23]">Nie udało się narysować ilustracji</span>
                        {imageErrorsMap[currentPageIndex] && (
                          <span className="block text-[10px] text-rose-500 font-bold mt-2 max-w-[280px] bg-rose-50 border border-rose-100 p-2 rounded-xl text-center">
                            Wiadomość z API: {imageErrorsMap[currentPageIndex]}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => triggerImageRender(currentPageIndex, story.pages[currentPageIndex].image_prompt)}
                        className="px-4 py-2 bg-[#6B705C] hover:bg-[#585c4b] text-white text-[10px] font-bold uppercase rounded-xl cursor-pointer"
                      >
                        Spróbuj ponownie
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="font-serif text-base font-bold italic text-center text-[#4A4A40] leading-relaxed px-2">
                    "{story.pages[currentPageIndex]?.story_text || "..."}"
                  </p>
                  
                  <div className="h-[1px] w-12 bg-[#D4A373] mx-auto"></div>
                  
                  <p className="text-[10px] text-[#9A9A92] uppercase tracking-[0.1em] text-center font-bold">
                    Wiek czytelnika: {preferences.childAge} lat
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentPageIndex === 0}
                  className="p-3 bg-white border border-[#E5E5E1] rounded-full disabled:opacity-50 hover:bg-[#FAF9F6] transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-[#2D3142]" />
                </button>
                <span className="text-xs font-bold text-[#1A1C23] font-serif">
                  Strona {currentPageIndex + 1} z {story.pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = currentPageIndex + 1;
                    if (nextIdx > 0 && !unlockedPages[nextIdx]) {
                      handleUnlockBookAndNavigate(nextIdx);
                    } else {
                      setCurrentPageIndex(nextIdx);
                    }
                  }}
                  disabled={currentPageIndex === story.pages.length - 1}
                  className="p-3 bg-white border border-[#E5E5E1] rounded-full hover:bg-[#FAF9F6] disabled:opacity-50 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-[#2D3142]" />
                </button>
              </div>

              <div className="flex flex-col gap-3.5 w-full">
                {unlockedCount < 15 ? (
                  <p className="text-[11px] text-[#D4A373] text-center font-semibold leading-normal animate-pulse px-2 font-sans">
                    🌟 Czytasz darmowy rozdział. Odblokuj pełną bajkę, aby wydrukować kolorowanki!
                  </p>
                ) : !isAllImagesLoaded ? (
                  <p className="text-[11px] text-slate-400 text-center font-medium leading-normal animate-pulse px-2 font-sans">
                    Rysujemy ilustracje w najwyższej rozdzielczości do druku. To zajmie tylko chwilę!
                  </p>
                ) : null}
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(-1);
                      setStory(null);
                    }}
                    className="flex-1 py-3 bg-white border border-[#E5E5E1] text-[#2D3142] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Pulpit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (unlockedCount < 15) {
                        handleUnlockBookAndNavigate();
                      } else if (isAllImagesLoaded) {
                        window.print();
                      }
                    }}
                    disabled={unlockedCount === 15 && !isAllImagesLoaded}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all font-sans ${
                      (unlockedCount < 15 || isAllImagesLoaded)
                        ? "bg-[#6B705C] hover:bg-[#585c4b] text-white cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-sm" 
                        : "bg-[#E5E5E1] text-[#9A9A92] cursor-not-allowed animate-pulse"
                    }`}
                  >
                    {(unlockedCount < 15 || isAllImagesLoaded) ? (
                      <Printer className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
                    )}
                    <span>
                      {unlockedCount < 15 
                        ? "Pobierz pełny plik PDF (15 str.) 🔒" 
                        : isAllImagesLoaded 
                          ? `Pobierz książeczkę (${unlockedCount} str. PDF)` 
                          : `Rysowanie ilustracji (${loadedImagesCount}/${unlockedCount})...`}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </section>
      </div>

      {/* Drukuj całą książkę - widoczne tylko przy drukowaniu */}
      {step === 5 && story && (
        <div className="hidden print:block bg-white text-black font-serif w-full mx-auto p-0">
          
          {/* Strona Okładkowa */}
          <div 
            className="w-full mx-auto flex flex-col items-center justify-center p-12 page-break-after" 
            style={{ 
              boxSizing: 'border-box', 
              height: '297mm', 
              maxHeight: '297mm', 
              overflow: 'hidden', 
              position: 'relative', 
              pageBreakInside: 'avoid', 
              breakInside: 'avoid',
              pageBreakAfter: 'always',
              breakAfter: 'page'
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4A373] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Paintbrush className="text-white w-8 h-8" />
              </div>
              <h1 className="text-5xl font-serif font-black mb-4 leading-tight text-[#1A1C23]">{story.title}</h1>
              <div className="h-[2px] w-24 bg-[#D4A373] mx-auto mb-8"></div>
              <p className="text-xl tracking-widest text-slate-500 uppercase font-bold">Magiczna Kolorowanka dla</p>
              <p className="text-4xl font-serif font-black text-[#1A1C23] mt-3">{preferences.childName}</p>
              <p className="text-sm text-slate-400 mt-16 font-mono">
                Wiek: {preferences.childAge} {preferences.childAge === 5 ? "lat" : [2, 3, 4].includes(preferences.childAge % 10) && ![12, 13, 14].includes(preferences.childAge) ? "lata" : "lat"} • Kraina: {preferences.world} • Postać: {preferences.archetype}
              </p>
            </div>
          </div>
          
          {story.pages.map((page, idx) => {
            if (!unlockedPages[idx]) return null;
            return (
              <div 
                key={idx} 
                className="w-full mx-auto flex flex-col items-center justify-between p-8 page-break-after" 
              style={{ 
                boxSizing: 'border-box', 
                height: '297mm', 
                maxHeight: '297mm', 
                overflow: 'hidden', 
                position: 'relative', 
                pageBreakInside: 'avoid', 
                breakInside: 'avoid',
                pageBreakAfter: 'always',
                breakAfter: 'page'
              }}
            >
              <div className="text-center w-full">
                <h2 className="text-xl font-serif font-black text-[#1A1C23] tracking-tight">{story.title}</h2>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-1">Rozdział {idx + 1}</span>
              </div>

              <div 
                className="w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center justify-center mx-auto my-2" 
                style={{ maxHeight: '220mm', aspectRatio: '3/4', width: 'auto' }}
              >
                {imagesMap[idx] ? (
                  <img 
                    src={imagesMap[idx]} 
                    alt={`Strona ${idx + 1}`} 
                    className="w-full h-full object-contain object-center" 
                    style={{ maxHeight: '220mm', width: 'auto', objectFit: 'contain', objectPosition: 'center' }}
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400 flex flex-col items-center justify-center h-full">
                    <Paintbrush className="w-10 h-10 text-slate-350 mb-2 animate-pulse" />
                    <p className="text-sm font-bold">Ilustracja nie załadowana</p>
                    <p className="text-xs">Uruchom podgląd strony {idx + 1} w aplikacji przed wydrukowaniem.</p>
                  </div>
                )}
              </div>

              <div className="text-center w-full max-w-[650px] mx-auto" style={{ marginTop: '6mm', marginBottom: '0px' }}>
                <p className="italic font-bold text-slate-900 leading-relaxed px-4 text-sm" style={{ fontSize: '11pt' }}>
                  "{page.story_text}"
                </p>
                <span className="block mt-2 text-[10px] text-slate-400 font-mono">Strona {idx + 1}</span>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {showStripeModal && (
        <StripeCheckoutSimulator
          childName={preferences.childName || "Dziecko"}
          onClose={() => setShowStripeModal(false)}
        />
      )}
    </div>
  );
}
