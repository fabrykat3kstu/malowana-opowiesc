import { ArchetypeOption, WorldOption, MoralOption } from "./types";

export const ARCHETYPES: ArchetypeOption[] = [
  {
    id: "Astronauta",
    label: "Kosmiczny Astronauta",
    description: "Odkrywca odległych gwiazd i planet, latający błyszczącą rakietą.",
    icon: "Rocket",
    promptTemplate: "a brave child astronaut in a white space-suit with friendly patches"
  },
  {
    id: "Dzielny Rycerz",
    label: "Dzielny Rycerz / Wojowniczka",
    description: "Broni uciśnionych i dba o to, by każdemu wokół działo się dobrze.",
    icon: "Shield",
    promptTemplate: "a kind child knight wearing shiny light armor and helmet with a soft feather"
  },
  {
    id: "Dinozaur",
    label: "Przyjaciel Dinozaurów",
    description: "Potrafi rozmawiać z olbrzymimi stworzeniami i wspólnie się z nimi bawi.",
    icon: "Baby",
    promptTemplate: "a happy child adventurer holding hands with a cute friendly baby triceratops"
  },
  {
    id: "Syrenka",
    label: "Morska Syrenka / Syren",
    description: "Pływa z delfinami i zna najgłębsze sekrety morskiej krainy.",
    icon: "Fish",
    promptTemplate: "a magical child mermaid with a shiny fish tail sitting on a smooth stone"
  },
  {
    id: "Młody Czarodziej",
    label: "Młody Czarodziej / Czarównica",
    description: "Zna zaklęcia, które pomagają roślinom rosnąć, a smutnym się uśmiechać.",
    icon: "Wand2",
    promptTemplate: "a smiling child wizard wearing a starry pointed hat and holding a glowing wand"
  },
  {
    id: "Strażak",
    label: "Dzielny Mały Strażak",
    description: "Zawsze spieszy z pomocą, pomaga kotkom schodzić z drzew i dba o bezpieczeństwo.",
    icon: "Flame",
    promptTemplate: "a brave child firefighter in a firefighter jacket and helmet"
  }
];

export const WORLDS: WorldOption[] = [
  {
    id: "Kosmiczna Stacja",
    label: "Świecąca Stacja Kosmiczna",
    description: "Kraina pełna latających gwiazd, okrągłych planet i uśmiechniętych robotów.",
    icon: "Star",
    promptTemplate: "futuristic cosmic space station with starry sky viewport, small cute helper robots, hanging stars and glowing nebulae"
  },
  {
    id: "Tajemniczy Las",
    label: "Tajemniczy Elficki Las",
    description: "Pełen żywych, świecących kwiatów, mądrych mówiących drzew i gniazd leśnych ptaszków.",
    icon: "TreePine",
    promptTemplate: "enchanted mystic forest with giant friendly hollow trees, beautiful wild flowers, tiny lanterns hanging from branches"
  },
  {
    id: "Podwodny Pałac",
    label: "Podwodny Koralowy Pałac",
    description: "Gdzie zamki zbudowane są z muszelek, a rybki grają w berka pod wodą.",
    icon: "Droplets",
    promptTemplate: "beautiful coral reef kingdom under the ocean, friendly bubble blowing fish, sea stars, shell castles on soft sand"
  },
  {
    id: "Zaginiona Wyspa",
    label: "Zaginiona Wyspa Skarbów",
    description: "Ciepła wyspa z palmami kokosowymi, radosnymi papugami i starymi mapami.",
    icon: "Map",
    promptTemplate: "tropical paradise island with a soft sandy beach, gentle waves, large safe palm trees, small wooden chest with toys"
  },
  {
    id: "Zamek w Chmurach",
    label: "Zamek na Puszystych Chmurach",
    description: "Gdzie drogi zrobione są z tęczy, a pałace są miękkie i bezpieczne jak poduszki.",
    icon: "Castle",
    promptTemplate: "gorgeous castle floating on huge fluffy cumulus clouds, arches of tiny rainbows, birds flying peacefully around"
  }
];

export const MORALS: MoralOption[] = [
  {
    id: "O dzieleniu się z innymi",
    label: "Radość z dzielenia się",
    description: "Bohater dowiaduje się, że dzielenie się zabawkami daje dwa razy więcej szczęścia.",
    icon: "Heart"
  },
  {
    id: "O pokonywaniu strachu",
    label: "Odwaga i pokonywanie strachu",
    description: "Bohater uczy się, że strach ma wielkie oczy, a prawdziwa odwaga to próbowanie nowych rzeczy mimo lęku.",
    icon: "Shield"
  },
  {
    id: "O sile prawdziwej przyjaźni",
    label: "Siła wielkiej przyjaźni",
    description: "Bohater odkrywa, że z przyjaciółmi każdy problem staje się małą, wspólną przygodą.",
    icon: "BookOpen"
  }
];
