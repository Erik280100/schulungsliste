export const STORAGE_KEY = "schulung-v4";
export const COLORS = [
  "#2456d6", "#0f9d74", "#d9822b", "#8e44ad", "#c0392b", "#16a2b8", "#7f8c00",
  "#d6336c", "#5f6b7a", "#3b82f6", "#a0522d", "#2f9e44", "#e8590c",
];

// Zustände, die keine Themen-Karte haben (stehen im Dropdown ganz oben)
export const SPECIAL = ["Fehlt", "Nicht bearbeitet", "Anwesend"];

const V = "Verkauf Produkte";
const E = "Empfehlungen Kunden / Partner";
const M = "Maklervorbereitung";
const TE = "Telefonieren";
const A = "Analyse neu";
const BP = "Analyse Big Points";
const THEMEN = [
  BP, M, "Produktschulung", TE, A, "Beratung Ablauf", V, "Telefonparty + Monatsplanung",
  "FK to be / Training", E, "Keynote + Hot Chair", "Finanzierung", "FK Training",
];
const F = "__fehlt";
const NB = "__nicht_bearbeitet";

export function defaultState() {
  const fk = (name, thema, status = "anwesend", marker = null) => ({ name, thema, status, marker });
  const tr = (name, gruppe, thema) => ({
    name,
    gruppe,
    thema: thema === F || thema === NB ? null : thema,
    status: thema === F ? "fehlt" : "anwesend",
  });
  return {
    themen: THEMEN,
    fks: [
      fk("Shahir A.", null, "fehlt"), fk("Amel B.", null, "fehlt"), fk("Samuel B.", E),
      fk("Erik B.", M), fk("Filip B.", V), fk("Tobias B.", TE), fk("Sedin C.", A),
      fk("Sandro F.", M), fk("Hamza H.", TE), fk("Elias K.", M), fk("Georg K.", null),
      fk("Christian L.", null, "fehlt"), fk("Marco M.", null, "fehlt"), fk("Aldin M.", E),
      fk("Leonhard O.", M), fk("Michael P.", M), fk("Philipp R.", null), fk("Marko R.", null, "fehlt"),
      fk("David S.", null, "fehlt"), fk("Walid S.", null, "anwesend", "Nicht bearbeitet"), fk("Philipp S.", M), fk("Admir S.", null),
      fk("Lukas S.", null), fk("Noah V.", M),
    ].map((f, i) => ({ id: "f" + i, ...f })),
    // Gruppen wie im bisherigen Tool: [Gruppenleiter, [[Trainee, Thema], ...]]
    // F = fehlt, NB = nicht bearbeitet (anwesend, noch ohne Thema)
    trainees: [
      ["Christian Leski", [["Rene U.", F]]],
      ["Sedin Cehajic", [["David S.", F]]],
      ["Aldin Mujanic", [["Ulas D.", F], ["Aldin K.", V], ["Bojan V.", F], ["Admir Z.", V], ["Armin Z.", V]]],
      ["Sandro Fink", [["Marie H.", E], ["Rosalie R.", E], ["Daniel S.", A]]],
      ["Elias Karner", [["Matteo B.", TE], ["Stefan B.", TE], ["Sito-Sebastian E.", E], ["Valentino K.", F], ["Andra K.", TE], ["Lisa S.", V]]],
      ["Marco Messner", [["Erik H.", F]]],
      ["Georg Koegerl", [["Delia P.", F], ["Ali P.", M], ["Martina T.", TE], ["Tobias Z.", E]]],
      ["Michael Posch", [["Kevin H.", F], ["Bruno M.", F], ["Marco S.", F]]],
      ["Erik Bindar", [["Jelena P.", A]]],
      ["Walid Sedighi", [["Samet A.", TE], ["Krystian M.", TE], ["Erfan Q.", A], ["Mariam r.", F], ["Arshiya S.", TE], ["Qayoom V.", TE]]],
      ["Hamza Hamzic", [["Patrick B.", A], ["Senad R.", TE]]],
      ["Amel Begic", [["Saban S.", F], ["Mahir Z.", F]]],
      ["Leonhard Ogris", [["Hannes P.", NB]]],
      ["Shahir Azizi", [["Shahid A.", V], ["Hamid R.", E]]],
      ["David Schrey", [["Nico K.", TE], ["Josef N.", F]]],
      ["Noah Vanek", [["Elisabeth L.", F]]],
      ["Samuel Bernhard", [["Cristina M.", E], ["Hamza Z.", NB]]],
      ["Philipp Simbürger", [["Valentina B.", F], ["Luka D.", TE]]],
      ["Philipp Radl", [["Franz Anton E.", F], ["Peter K.", F]]],
      ["Lukas Slunjski", [["Filip B.", F], ["Alexander F.", F], ["Nico K.", F], ["Kai R.", F], ["Gabriel Z.", F]]],
      ["Filip Bonat", [["Matthias A.", F], ["Razvan B.", F], ["Fidan C.", BP], ["David G.", F], ["Amar R.", TE], ["Marco W.", F]]],
      ["Tobias Bonat", [["Sebastian B.", F], ["Samuel B.", TE], ["David P.", F], ["Elias P.", F], ["Mateus R.", F]]],
    ]
      .flatMap(([gruppe, list]) => list.map(([name, thema]) => tr(name, gruppe, thema)))
      .map((t, i) => ({ id: "t" + i, ...t })),
  };
}

export function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && s.themen && s.fks && s.trainees) return s;
  } catch {
    /* kein Zugriff auf localStorage: Standarddaten */
  }
  return defaultState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignorieren */
  }
}

export const newId = (prefix) => prefix + Date.now() + Math.floor(Math.random() * 1000);
