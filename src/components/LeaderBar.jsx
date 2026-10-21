import { Avatar, ThemaSelect, colorOf } from "./common.jsx";

export default function LeaderBar({ state, dispatch }) {
  const sorted = [...state.fks].sort((a, b) => (a.status === "fehlt") - (b.status === "fehlt"));
  return (
    <div className="fk-bar">
      {sorted.map((f) => {
        const off = f.status === "fehlt";
        return (
          <div
            key={f.id}
            className={"fk" + (off ? " off" : "")}
            style={{ "--c": f.thema ? colorOf(state.themen, f.thema) : "var(--line)" }}
          >
            <div className="fk-head">
              <input
                type="checkbox"
                checked={!off}
                onChange={(e) =>
                  dispatch({ type: "fk", id: f.id, patch: { status: e.target.checked ? "anwesend" : "fehlt" } })
                }
              />
              <Avatar name={f.name} color={f.thema ? colorOf(state.themen, f.thema) : "var(--muted)"} />
              <span className="name">{f.name}</span>
            </div>
            <ThemaSelect themen={state.themen} person={f} isFk list="fks" dispatch={dispatch} />
          </div>
        );
      })}
    </div>
  );
}
