import { COLORS, SPECIAL, fkRaumKey, raumKey } from "../data.js";

export const colorOf = (themen, thema) => {
  const i = themen.indexOf(thema);
  return i < 0 ? "var(--line)" : COLORS[i % COLORS.length];
};

// Was das Dropdown für eine Person anzeigt: Fehlt / Nicht bearbeitet / Anwesend / Thema
export function valueOf(p, isFk) {
  if (p.status === "fehlt") return "Fehlt";
  if (p.thema) return p.thema;
  return p.marker || (isFk ? "Anwesend" : "Nicht bearbeitet");
}

export function ThemaSelect({ themen, person, isFk, list, dispatch, short, title }) {
  return (
    <select
      className={short ? "short" : undefined}
      value={valueOf(person, isFk)}
      title={title}
      onChange={(e) => dispatch({ type: "setValue", list, id: person.id, value: e.target.value })}
    >
      {[...SPECIAL, ...themen].map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

// Eine FK mit Thema trainiert, außer sie ist als Teilnehmer markiert (FK-Training)
export const isTrainer = (f) => f.rolle !== "teilnehmer";

// Anwesende Trainees, deren Thema keine anwesende Führungskraft hat -> nicht wirklich zugeteilt
export const unledTrainees = (state) => {
  const led = new Set(
    state.fks.filter((f) => f.status === "anwesend" && f.thema && isTrainer(f)).map((f) => f.thema),
  );
  return state.trainees.filter((t) => t.status === "anwesend" && t.thema && !led.has(t.thema));
};

// Alle Karten der Ergebnis-Ansicht (auch Grundlage für den Excel-Export):
// pro Thema eine Karte, bei aufgeteilten Themen je Trainer eine Teilgruppe,
// plus eine eigene Karte (eigener Raum), wenn Führungskräfte am Thema teilnehmen.
export function buildCards(state) {
  const fkHere = state.fks.filter((f) => f.status === "anwesend");
  const placed = state.trainees.filter((t) => t.status === "anwesend" && t.thema);
  const cards = [];
  state.themen.forEach((th) => {
    const trainers = fkHere.filter((f) => f.thema === th && isTrainer(f));
    const guests = fkHere.filter((f) => f.thema === th && !isTrainer(f));
    const list = placed.filter((t) => t.thema === th);
    if (trainers.length || list.length) {
      if (state.split[th] && trainers.length > 1) {
        const parts = trainers.map((f, i) => ({
          kind: "trainees",
          thema: th,
          leaders: [f],
          list: [],
          fkId: f.id,
          teil: i + 1,
          raumKey: raumKey(th, f.id),
        }));
        // Trainees ohne gültige Teilgruppe (z. B. später hinzugekommen) kommen in die kleinste
        list.forEach((t) => {
          const own = parts.find((p) => p.fkId === t.fkId);
          (own || parts.reduce((m, p) => (p.list.length < m.list.length ? p : m))).list.push(t);
        });
        cards.push(...parts);
      } else {
        cards.push({ kind: "trainees", thema: th, leaders: trainers, list, raumKey: th });
      }
    }
    if (guests.length) {
      cards.push({ kind: "fk", thema: th, leaders: trainers, list: guests, raumKey: fkRaumKey(th) });
    }
  });
  return cards;
}

// Eingabefelder speichern erst beim Verlassen (onBlur), damit das Tippen nicht jedes Mal neu rendert.
export function NameInput({ value, onCommit, placeholder, className }) {
  return (
    <input
      type="text"
      className={className}
      key={value}
      defaultValue={value}
      placeholder={placeholder}
      onBlur={(e) => e.target.value !== value && onCommit(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

export const initials =(name) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

export function Avatar({ name, color }) {
  return (
    <span className="avatar" style={color ? { "--c": color } : undefined}>
      {initials(name)}
    </span>
  );
}

// Teilnehmende Führungskraft in der FK-Training-Karte
export function FkChip({ f, themen, alert }) {
  return (
    <div className={"tr nodrag" + (alert ? " alert" : "")} style={{ "--c": colorOf(themen, f.thema) }}>
      <div className="who">
        <Avatar name={f.name} color={colorOf(themen, f.thema)} />
        <span>
          {f.name}
          <small>Führungskraft</small>
        </span>
      </div>
    </div>
  );
}

// Ergebnis-Ansicht: nur anzeigen (Zuteilung passiert oben in Schritt 2), aber per Drag & Drop verschiebbar
export function TraineeChip({ t, themen, alert }) {
  return (
    <div
      className={"tr" + (alert ? " alert" : "")}
      style={{ "--c": colorOf(themen, t.thema) }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
    >
      <div className="who">
        <Avatar name={t.name} color={t.thema ? colorOf(themen, t.thema) : "var(--muted)"} />
        <span>
          {t.name}
          <small>Gruppe {t.gruppe}</small>
        </span>
      </div>
    </div>
  );
}
