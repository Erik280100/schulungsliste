import { TraineeChip } from "./common.jsx";

export function Unassigned({ state, dispatch }) {
  const open = state.trainees.filter((t) => t.status === "anwesend" && !t.thema);
  return (
    <div className={"pool" + (open.length ? " chips" : "")}>
      {open.length ? (
        open.map((t) => <TraineeChip key={t.id} t={t} themen={state.themen} dispatch={dispatch} />)
      ) : (
        <span className="empty">Alle anwesenden Trainees sind eingeteilt.</span>
      )}
    </div>
  );
}

export function Absent({ state }) {
  const fks = state.fks.filter((f) => f.status === "fehlt");
  const trs = state.trainees.filter((t) => t.status === "fehlt");
  return (
    <div className="pool">
      <div>
        <b>Führungskräfte:</b> {fks.length ? fks.map((f) => f.name).join(", ") : "–"}
      </div>
      <div style={{ marginTop: 4 }}>
        <b>Trainees:</b>{" "}
        {trs.length
          ? trs.map((t, i) => (
              <span key={t.id}>
                {i > 0 && ", "}
                <span className="x">{t.name}</span> <small className="muted">({t.gruppe})</small>
              </span>
            ))
          : "–"}
      </div>
    </div>
  );
}
