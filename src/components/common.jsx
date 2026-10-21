import { COLORS, SPECIAL } from "../data.js";

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

// Anwesende Trainees, deren Thema keine anwesende Führungskraft hat -> nicht wirklich zugeteilt
export const unledTrainees = (state) => {
  const led = new Set(state.fks.filter((f) => f.status === "anwesend" && f.thema).map((f) => f.thema));
  return state.trainees.filter((t) => t.status === "anwesend" && t.thema && !led.has(t.thema));
};

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
