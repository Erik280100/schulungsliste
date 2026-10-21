import { Avatar, ThemaSelect, colorOf, unledTrainees } from "./common.jsx";

// Schritt 2: Jeder Trainee bekommt in seiner Gruppe ein Thema (oder Fehlt / Nicht bearbeitet / Anwesend)
export default function TraineeGroups({ state, dispatch }) {
  const unled = new Set(unledTrainees(state).map((t) => t.id));
  const gruppen = [...new Set(state.trainees.map((t) => t.gruppe))];
  return (
    <div className="groups">
      {gruppen.map((g) => {
        const members = state.trainees.filter((t) => t.gruppe === g);
        const done = members.filter((t) => t.status === "fehlt" || t.thema).length;
        return (
          <div className="gcard" key={g}>
            <h3>
              Gruppe von {g}
              <span className="gcount">
                {done}/{members.length}
              </span>
            </h3>
            {members.map((t) => (
              <div className={"grow" + (t.status === "fehlt" ? " off" : "") + (unled.has(t.id) ? " alert" : "")} key={t.id}>
                <Avatar
                  name={t.name}
                  color={t.thema ? colorOf(state.themen, t.thema) : "var(--muted)"}
                />
                <span className="gname">{t.name}</span>
                <ThemaSelect short themen={state.themen} person={t} list="trainees" dispatch={dispatch} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
