import { useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";

interface StripeCheckoutSimulatorProps {
  childName: string;
  onClose: () => void;
}

export default function StripeCheckoutSimulator({ childName, onClose }: StripeCheckoutSimulatorProps) {
  const [stage, setStage] = useState<"form" | "processing">("form");
  const [selectedPlan, setSelectedPlan] = useState<"one" | "three" | "six" | "twelve">("three");
  const [userEmail, setUserEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = async () => {
    if (!userEmail.trim() || !userEmail.includes("@")) {
      setErrorMsg("Proszę wpisać poprawny adres e-mail.");
      return;
    }
    setErrorMsg("");
    setStage("processing");

    try {
      const packageTypeMap = {
        one: "1_story",
        three: "3_stories",
        six: "6_stories",
        twelve: "12_stories"
      };
      const packageType = packageTypeMap[selectedPlan];

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType,
          childName,
          userEmail
        })
      });

      if (!res.ok) {
        let errMsg = "Nie udało się utworzyć sesji Stripe.";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {
          try {
            const rawText = await res.text();
            if (rawText) {
              errMsg = rawText;
            }
          } catch (__) {}
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Brak adresu URL płatności w odpowiedzi serwera.");
      }
    } catch (e: any) {
      console.error("Stripe Checkout Redirect Error:", e);
      setErrorMsg(e.message || "Błąd podczas łączenia z płatnościami.");
      setStage("form");
    }
  };

  const getPlanDetails = () => {
    switch (selectedPlan) {
      case "one":
        return { name: 'Pakiet "Wypróbuj" (1 bajka)', price: "12,00 PLN" };
      case "three":
        return { name: 'Pakiet "Najpopularniejszy" (3 bajki)', price: "29,00 PLN" };
      case "six":
        return { name: 'Pakiet "Na całe wakacje" (6 bajek)', price: "49,00 PLN" };
      case "twelve":
        return { name: 'Pakiet "Prezent dla przedszkola" (12 bajek)', price: "89,00 PLN" };
    }
  };

  const plan = getPlanDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-scaleIn font-sans">
        
        {/* Stripe Official Styled Header */}
        <div className="bg-[#635BFF] text-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-auto text-white fill-current" viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.9 14.8c0-3.3 1.9-4.8 5-4.8 2.1 0 3.7.6 4.6 1.1v-4.5c-.9-.4-2.8-.8-4.9-.8-6.1 0-9.8 3.5-9.8 9.3 0 6.6 4.3 8.7 8.7 9.5 3.3.6 4.4 1.4 4.4 2.9 0 1.5-1.5 2.5-4.2 2.5-2.5 0-4.7-.8-5.7-1.4v4.5c1.1.5 3.4 1 5.8 1 6.5 0 9.4-3.4 9.4-8.8 0-6.1-4.2-8.3-8.8-9.1-3.3-.6-4.5-1.3-4.5-2.7zm18.6-8.5c-2.3 0-3.7 1-4.4 1.9v-1.6h-4.9v25.2l5.1-1.1V17.9c.7 1.1 2.2 1.7 4 1.7 3.8 0 6.9-3.1 6.9-7.4 0-4.1-3-7.2-6.7-7.2zm-.9 10.4c-2.1 0-3.3-1.6-3.3-3.2 0-1.7 1.2-3.2 3.3-3.2 2.1 0 3.2 1.5 3.2 3.2 0 1.7-1.1 3.2-3.2 3.2zm11.7-10.4h-5.1v14.1h5.1V6.3zm-2.6-6.1c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm18 12.5c0-4.6-2.1-6.4-5.3-6.4-2 0-3.6.8-4.4 2v-1.7h-4.9v14.1h5.1v-7.9c0-1.9 1.1-2.9 2.8-2.9.8 0 1.5.2 2 .5l.7-4.7c-.5-.2-1.2-.3-1.9-.3-1.7 0-3 .8-3.6 2.1v-.8zm9.5-6.1c-4.4 0-7.3 3.1-7.3 7.4 0 4.2 2.8 7.2 7 7.2 2.5 0 4.3-.8 5.3-1.5l-1.1-3.4c-.7.4-2 .8-3.3.8-1.9 0-3.1-.9-3.3-2.4h8.3c.1-.4.1-.8.1-1.3 0-4.2-2.6-6.8-5.8-6.8zm-2.5 5.5c.2-1.4 1.2-2.3 2.5-2.3 1.3 0 2 .9 2.1 2.3h-4.6z"/>
            </svg>
            <span className="text-[10px] bg-white/20 text-white font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
              Checkout
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white text-xs font-bold px-3 py-1 bg-white/10 hover:bg-white/25 rounded-full transition-all cursor-pointer"
          >
            Anuluj
          </button>
        </div>

        {stage === "form" && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 font-serif">Wybierz pakiet bajek</h3>
              <p className="text-xs text-slate-400 font-sans">Zakupione bajki nigdy nie wygasają. Możesz ich użyć w dowolnej chwili.</p>
              <div className="inline-flex items-center gap-1 bg-[#635BFF]/10 text-[#635BFF] text-[10px] font-bold px-3 py-1 rounded-full font-mono">
                <Lock size={10} /> Bezpieczne połączenie SSL
              </div>
            </div>

            {/* Plan selection cards */}
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedPlan("one")}
                className={`w-full p-3.5 border-2 rounded-2xl flex items-center justify-between text-left transition-all ${
                  selectedPlan === "one"
                    ? "border-[#635BFF] bg-[#635BFF]/5"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-700 text-xs font-sans">Pakiet "Wypróbuj"</h4>
                  <p className="text-[10px] text-slate-400 font-sans">1 magiczna bajka (odblokowanie 1 kolorowanki)</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-xs">12,00 PLN</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("three")}
                className={`w-full p-3.5 border-2 rounded-2xl flex items-center justify-between text-left transition-all ${
                  selectedPlan === "three"
                    ? "border-[#635BFF] bg-[#635BFF]/5"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1 font-sans">
                    Pakiet "Najpopularniejszy" <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-serif font-bold">⭐</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium font-sans">3 magiczne bajki (odblokowanie 3 kolorowanek)</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-xs">29,00 PLN</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("six")}
                className={`w-full p-3.5 border-2 rounded-2xl flex items-center justify-between text-left transition-all ${
                  selectedPlan === "six"
                    ? "border-[#635BFF] bg-[#635BFF]/5"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-700 text-xs font-sans">Pakiet "Na całe wakacje"</h4>
                  <p className="text-[10px] text-slate-400 font-sans">6 magicznych bajek (odblokowanie 6 kolorowanek)</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-xs">49,00 PLN</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("twelve")}
                className={`w-full p-3.5 border-2 rounded-2xl flex items-center justify-between text-left transition-all ${
                  selectedPlan === "twelve"
                    ? "border-[#635BFF] bg-[#635BFF]/5"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-700 text-xs font-sans">Pakiet "Prezent dla przedszkola"</h4>
                  <p className="text-[10px] text-slate-400 font-sans">12 magicznych bajek (odblokowanie 12 kolorowanek)</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-xs">89,00 PLN</span>
                </div>
              </button>
            </div>

            {/* Email input field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide font-sans">E-mail do wysyłki bajek i potwierdzenia</label>
              <input
                type="email"
                placeholder="np. rodzic@opowiesc.pl"
                value={userEmail}
                onChange={(e) => {
                  setUserEmail(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full bg-[#FAF9F6] px-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#635BFF] font-sans transition-all"
              />
              {errorMsg && (
                <p className="text-[10px] text-rose-500 font-bold font-sans mt-1">
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>

            {/* Simulated Official Order Summary Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5 font-sans">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs text-slate-500 font-medium">Wybrana opcja:</span>
                <span className="text-xs font-bold text-slate-800">{plan?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-800 font-extrabold font-sans">Do zapłaty:</span>
                <span className="text-sm font-black text-[#635BFF] font-sans">{plan?.price}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePay}
                className="w-full bg-[#635BFF] text-white p-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#544CF0] transition-all shadow-md active:scale-[0.99] hover:scale-[1.01] font-sans"
              >
                <ShieldCheck size={16} />
                Zapłać przez Stripe
              </button>

              <div className="flex flex-col items-center gap-2 pt-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold font-sans">Bezpieczna płatność obsługiwana przez Stripe:</span>
                <div className="flex items-center gap-3 grayscale opacity-60 hover:opacity-90 transition-all">
                  {/* BLIK Badge */}
                  <span className="text-[9px] font-black tracking-wider text-[#E30613] font-sans border-2 border-[#E30613] px-1.5 py-0.2 rounded-xs bg-rose-50/50 leading-tight">BLIK</span>
                  {/* VISA Logo */}
                  <svg className="h-3 w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.2 36L22.1 18H26.9L24 36H19.2Z" fill="#1A1F71"/>
                    <path d="M37.3 18.5C36.4 18.1 35.0 17.8 33.3 17.8C28.3 17.8 24.8 20.4 24.8 24.1C24.8 26.8 27.3 28.3 29.2 29.2C31.2 30.1 31.8 30.7 31.8 31.6C31.8 32.9 30.2 33.5 28.7 33.5C26.7 33.5 25.5 33.0 24.6 32.6L23.8 36.3C24.8 36.8 26.6 37.2 28.4 37.2C33.7 37.2 37.2 34.6 37.2 30.6C37.2 24.7 29.1 24.4 29.1 21.6C29.1 20.7 30.0 19.8 31.7 19.8C33.1 19.6 34.4 19.9 35.4 20.3L37.3 18.5Z" fill="#1A1F71"/>
                    <path d="M46.8 18H42.2C40.8 18 39.9 18.8 39.3 20.1L32.4 36H37.4C37.4 36 38.2 33.8 39.9 33.8H46.1C46.2 34.4 46.7 36 46.7 36H51.1L46.8 18ZM41.1 30.6C42.2 27.6 44.5 21.4 44.5 21.4C44.5 21.4 44.8 22.3 45.1 23.4L45.5 30.6H41.1Z" fill="#1A1F71"/>
                    <path d="M12.6 18H4.6L4.1 20.2C8.7 21.3 11.7 23.6 12.6 25.8L11 36H16L23.5 18H18.2L12.6 30.5L12.6 18Z" fill="#F7B600"/>
                  </svg>
                  {/* MasterCard Logo */}
                  <svg className="h-3.5 w-auto" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="16" r="12" fill="#EB001B" fillOpacity="0.8"/>
                    <circle cx="30" cy="16" r="12" fill="#F79E1B" fillOpacity="0.8"/>
                    <path d="M24 8.5C21.8 10.5 20.5 13.1 20.5 16C20.5 18.9 21.8 21.5 24 23.5C26.2 21.5 27.5 18.9 27.5 16C27.5 13.1 26.2 10.5 24 8.5Z" fill="#FF5F00"/>
                  </svg>
                  <span className="text-[9px] font-extrabold text-slate-500 font-sans tracking-tight">Apple Pay / Google Pay / P24</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "processing" && (
          <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[340px] animate-fadeIn font-sans">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#635BFF] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-800">Łączenie z bezpieczną płatnością Stripe...</h3>
              <p className="text-xs text-slate-400 font-medium">Trwa przygotowywanie bezpiecznej sesji płatniczej.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
