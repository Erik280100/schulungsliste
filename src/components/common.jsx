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

export const initials = (name) =>
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

export function TraineeChip({ t, themen, dispatch }) {
  return (
    <div
      className="tr"
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
      <ThemaSelect short title="Thema ändern" themen={themen} person={t} list="trainees" dispatch={dispatch} />
    </div>
  );
}
