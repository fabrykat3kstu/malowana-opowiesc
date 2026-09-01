import { useState } from "react";
import { User, Shield, Key, Eye, FileText, Database, ShieldAlert, Check, Sparkles, Coins, ShieldCheck } from "lucide-react";

export default function RegulaminContent() {
  const [activeTab, setActiveTab] = useState<"regulamin" | "privacy">("regulamin");

  return (
    <div className="space-y-8 w-full">
      {/* Tytuł i Podtytuł */}
      <div className="text-center space-y-3">
        <h2 className="font-serif text-3xl md:text-4xl font-black text-[#1A1C23] leading-tight">
          Regulamin i Polityka Prywatności
        </h2>
        <p className="text-xs uppercase tracking-widest text-[#9A9A92] font-extrabold font-mono">
          Wersja 1.0 · 2026
        </p>
      </div>

      {/* Zakładki */}
      <div className="flex bg-[#F2F1EC] p-1 rounded-2xl max-w-sm mx-auto border border-[#E5E5E1]">
        <button
          type="button"
          onClick={() => setActiveTab("regulamin")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans ${
            activeTab === "regulamin"
              ? "bg-[#1A1C23] text-white shadow-md"
              : "text-[#9A9A92] hover:text-slate-800"
          }`}
        >
          <span>📋 Regulamin</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("privacy")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans ${
            activeTab === "privacy"
              ? "bg-[#1A1C23] text-white shadow-md"
              : "text-[#9A9A92] hover:text-slate-800"
          }`}
        >
          <span>🔒 Prywatność</span>
        </button>
      </div>

      {/* Kontener Kart */}
      <div className="space-y-6">
        {activeTab === "regulamin" ? (
          <>
            {/* Sekcja I */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4A373]" />
                I. Świadczenie usług
              </h3>
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 font-serif">
                <p>
                  Serwis Malowana Opowieść oferuje generowanie spersonalizowanych bajek z ilustracjami do kolorowania w formacie PDF, przy użyciu zaawansowanych modeli sztucznej inteligencji (Google Gemini oraz Replicate).
                </p>
                <p>
                  Korzystanie z serwisu oraz dokonanie zakupu oznacza pełną akceptację niniejszych zasad.
                </p>
                <div className="pt-2 border-t border-slate-100 flex flex-col font-sans text-xs text-slate-600 space-y-1">
                  <p><strong>Usługodawca i Sprzedawca:</strong> Usługodawcą i Administratorem Danych Osobowych jest Paweł Kmiecik, prowadzący działalność nierejestrowaną pod marką Fabryka Tekstu, adres: ul. Skrzatów 19/2, 03-259 Warszawa, Polska, e-mail: <a href="mailto:fabryka.t3kstu@gmail.com" className="text-[#D4A373] hover:underline font-bold">fabryka.t3kstu@gmail.com</a>.</p>
                </div>
              </div>
            </div>

            {/* Sekcja II */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <User className="w-5 h-5 text-[#D4A373]" />
                II. Oświadczenia użytkownika
              </h3>
              <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E5E1]/50 space-y-4 text-xs md:text-sm text-slate-700 font-sans">
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    <strong className="text-slate-800">Wiek:</strong> Potwierdzasz, że masz ukończone 18 lat i zamawiasz produkt dla dziecka znajdującego się pod Twoją prawną opieką.
                  </li>
                  <li>
                    <strong className="text-slate-800">Dane dziecka:</strong> Podajesz imię dziecka w sposób całkowicie dobrowolny, wyłącznie w celu spersonalizowania generowanej bajki.
                  </li>
                  <li>
                    <strong className="text-slate-800">Weryfikacja treści przez rodzica:</strong> Użytkownik (rodzic/opiekun prawny) zobowiązuje się do zapoznania z treścią wygenerowanej bajki przed udostępnieniem jej dziecku.
                  </li>
                  <li>
                    <strong className="text-slate-800">Legalność:</strong> Zobowiązujesz się do korzystania z serwisu w sposób zgodny z obowiązującym prawem i dobrem dziecka.
                  </li>
                </ol>
              </div>
            </div>

            {/* Sekcja III */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4A373]" />
                III. Charakter i jakość usługi (AI Act – Art. 50)
              </h3>
              <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-xl flex items-start gap-4 text-xs md:text-sm text-slate-600 leading-relaxed font-serif">
                <div className="w-8 h-8 rounded-lg bg-[#D4A373]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#D4A373]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <p>
                    Zgodnie z art. 50 Aktu o Sztucznej Inteligencji (AI Act), informujemy, że treści oraz ilustracje generowane są automatycznie przez algorytmy sztucznej inteligencji (Google Gemini oraz Replicate).
                  </p>
                  <p>
                    Treść ma charakter artystyczny i rozrywkowy. Ilustracje są oryginalne – nie naruszają praw autorskich i nie przedstawiają postaci objętych ochroną prawną (np. z zastrzeżonych bajek komercyjnych). Użytkownik (rodzic/opiekun prawny) zobowiązuje się do zapoznania z treścią wygenerowanej bajki przed udostępnieniem jej dziecku.
                  </p>
                </div>
              </div>
            </div>

            {/* Sekcja IV */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#D4A373]" />
                IV. Płatności i zwroty
              </h3>
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-4 font-serif">
                <p>
                  Wszystkie płatności w serwisie są obsługiwane i zabezpieczane przez system <strong>Stripe</strong>. Zakupione bajki (kredyty) są przypisane do konta e-mail i nigdy nie wygasają.
                </p>
                <p>
                  Z uwagi na dostarczenie spersonalizowanych treści o charakterze cyfrowym, które są generowane natychmiast po zleceniu, <strong>prawo do odstąpienia od umowy zakupu jest ustawowo wyłączone</strong> (zgodnie z Art. 38 pkt 13 ustawy o prawach konsumenta), pod warunkiem wyrażenia przez konsumenta wyraźnej zgody przed zakupem.
                </p>
                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl text-slate-600 font-sans text-xs">
                  <strong>Pomoc techniczna:</strong> W przypadku jakichkolwiek problemów technicznych (np. błąd połączenia z API, brak wygenerowania ilustracji) oferujemy ponowne wygenerowanie bajki lub pełny zwrot środków. Prosimy o kontakt mailowy pod adresem <a href="mailto:fabryka.t3kstu@gmail.com" className="text-[#D4A373] hover:underline font-bold">fabryka.t3kstu@gmail.com</a>.
                </div>
              </div>
            </div>

            {/* Sekcja V */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4A373]" />
                V. Prawa do materiałów
              </h3>
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 font-serif">
                <p>
                  Z chwilą opłacenia i wygenerowania bajki Użytkownik otrzymuje bezterminowe, niewyłączne prawo do swobodnego korzystania, drukowania, modyfikowania i rozpowszechniania wygenerowanych materiałów na użytek prywatny oraz komercyjny.
                </p>
                <p>
                  Serwis Malowana Opowieść nie ogranicza Użytkownika w zakresie dysponowania pobranym plikiem PDF oraz zawartymi w nim kolorowankami.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Prywatność Sekcja I */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <User className="w-5 h-5 text-[#D4A373]" />
                I. Administrator i kontakt
              </h3>
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 font-serif">
                <p>
                  Usługodawcą i Administratorem Danych Osobowych jest Paweł Kmiecik, prowadzący działalność nierejestrowaną pod marką Fabryka Tekstu, adres: ul. Skrzatów 19/2, 03-259 Warszawa, Polska, e-mail: <a href="mailto:fabryka.t3kstu@gmail.com" className="text-[#D4A373] hover:underline font-bold">fabryka.t3kstu@gmail.com</a>.
                </p>
                <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E5E1]/50 font-sans text-xs space-y-1.5 text-slate-700">
                  <p><strong>Administrator:</strong> Paweł Kmiecik</p>
                  <p><strong>Forma działalności:</strong> Działalność nierejestrowana pod marką Fabryka Tekstu</p>
                  <p><strong>Adres:</strong> ul. Skrzatów 19/2, 03-259 Warszawa, Polska</p>
                  <p><strong>Kontakt e-mail:</strong> <a href="mailto:fabryka.t3kstu@gmail.com" className="text-[#D4A373] hover:underline font-bold">fabryka.t3kstu@gmail.com</a></p>
                </div>
              </div>
            </div>

            {/* Prywatność Sekcja II */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#D4A373]" />
                II. Jakie dane zbieramy i po co
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[#E5E5E1] text-[#9A9A92]">
                      <th className="py-3 px-2 font-bold uppercase tracking-wider">Dana</th>
                      <th className="py-3 px-2 font-bold uppercase tracking-wider">Cel przetwarzania</th>
                      <th className="py-3 px-2 font-bold uppercase tracking-wider">Szczegóły</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-3 px-2 font-bold text-slate-800">📧 E-mail</td>
                      <td className="py-3 px-2">Założenie konta, identyfikacja kredytów i wysyłka bajek PDF.</td>
                      <td className="py-3 px-2">Konieczne do realizacji usługi.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-bold text-slate-800">👶 Imię dziecka</td>
                      <td className="py-3 px-2">Wyłącznie personalizacja tekstu bajki oraz ilustracji (dane przetwarzane ze szczególną ostrożnością w celu realizacji umowy – art. 6 ust. 1 lit. b RODO).</td>
                      <td className="py-3 px-2 text-[#D4A373] font-semibold">Retencjonowane w bazie przez maksymalnie 90 dni, po czym bezpowrotnie usuwane.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-bold text-slate-800">💳 Płatności</td>
                      <td className="py-3 px-2">Obsługa i przetwarzanie transakcji przez bramkę Stripe.</td>
                      <td className="py-3 px-2">Serwis nie przechowuje ani nie ma dostępu do danych Twojej karty.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-bold text-slate-800">📊 Dane techniczne</td>
                      <td className="py-3 px-2">Adres IP, typ przeglądarki, pliki cookies.</td>
                      <td className="py-3 px-2">Statystyki odwiedzin, stabilność i bezpieczeństwo witryny.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Prywatność Sekcja III */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#D4A373]" />
                III. Dane dzieci – szczególna ostrożność (RODO)
              </h3>
              <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-xl flex gap-4 text-xs md:text-sm text-slate-600 leading-relaxed font-serif">
                <div className="w-10 h-10 rounded-full bg-[#D4A373]/10 flex items-center justify-center shrink-0 text-[#D4A373]">
                  <Shield className="w-5 h-5" fill="currentColor" fillOpacity={0.1} />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-800">Imię dziecka to dane przetwarzane ze szczególną ostrożnością w celu realizacji umowy - art. 6 ust. 1 lit. b RODO:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 font-sans text-xs">
                    <li>Dane przesyłane przez API do modeli AI (Google Gemini, Replicate) nie są wykorzystywane do trenowania publicznych modeli sztucznej inteligencji.</li>
                    <li>Nie przekazujemy ich żadnym podmiotom zewnętrznym w celach marketingowych czy reklamowych.</li>
                    <li>Dane w bazie są retencjonowane przez maksymalnie 90 dni wyłącznie w celu umożliwienia pobrania i ponownego wydruku bajki przez Użytkownika, po czym są trwale usuwane.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Prywatność Sekcja IV */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <Key className="w-5 h-5 text-[#D4A373]" />
                IV. Podmioty przetwarzające
              </h3>
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 font-serif">
                <p>
                  W celu sprawnego działania serwisu powierzamy przetwarzanie danych wyłącznie zaufanym partnerom technologicznym o najwyższym poziomie zabezpieczeń:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 font-sans text-xs text-slate-500">
                  <li><strong className="text-slate-700">Supabase</strong> – baza danych oraz logowanie (bezpieczne serwery na terenie Unii Europejskiej).</li>
                  <li><strong className="text-slate-700">Stripe</strong> – autoryzacja płatności elektronicznych (pełny standard PCI-DSS).</li>
                  <li><strong className="text-slate-700">Google Gemini</strong> – bezpieczne generowanie tekstu spersonalizowanych bajek przez API (dane nie służą do trenowania modeli publicznych).</li>
                  <li><strong className="text-slate-700">Replicate</strong> – generowanie ilustracji do kolorowanek przez API (dane nie służą do trenowania modeli publicznych).</li>
                </ul>
              </div>
            </div>

            {/* Prywatność Sekcja V */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4A373]" />
                V. Prawa użytkownika (RODO)
              </h3>
              <div className="text-xs md:text-sm text-slate-655 leading-relaxed space-y-3 font-serif">
                <p>
                  W związku z RODO, przysługują Ci następujące prawa w stosunku do Twoich danych osobowych:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4A373] shrink-0" /> Dostęp do danych oraz ich sprostowanie
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4A373] shrink-0" /> Usunięcie danych ("prawo do bycia zapomnianym")
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4A373] shrink-0" /> Ograniczenie lub przenoszenie danych
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4A373] shrink-0" /> Skarga do Urzędu Ochrony Danych Osobowych
                  </div>
                </div>
                <p className="pt-2 text-xs">
                  W celu realizacji swoich praw napisz do nas pod adres: <a href="mailto:fabryka.t3kstu@gmail.com" className="text-[#D4A373] hover:underline font-bold">fabryka.t3kstu@gmail.com</a>.
                </p>
              </div>
            </div>

            {/* Prywatność Sekcja VI */}
            <div className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-[#E5E5E1] border-l-4 border-l-[#D4A373] space-y-4">
              <h3 className="font-serif text-lg font-black text-[#1A1C23] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#D4A373]" />
                VI. Cookies i Meta Pixel
              </h3>
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 font-serif">
                <p>
                  Nasz serwis wykorzystuje pliki cookies do utrzymania sesji logowania, celów analitycznych oraz remarketingowych (Facebook / Meta Pixel).
                </p>
                <p>
                  Zgodę na cookies możesz wycofać w dowolnym momencie, usuwając ciasteczka w ustawieniach swojej przeglądarki internetowej.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
