import { useState } from "react";
import { TraineeChip, colorOf } from "./common.jsx";

function TopicCard({ thema, leaders, list, state, dispatch }) {
  const [over, setOver] = useState(false);
  const sorted = [...list].sort((a, b) => a.gruppe.localeCompare(b.gruppe));
  const drop = (e) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (state.trainees.some((t) => t.id === id)) dispatch({ type: "tr", id, patch: { thema } });
  };
  return (
    <div
      className={"card" + (over ? " over" : "")}
      style={{ "--c": colorOf(state.themen, thema) }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <h3>
        {thema} <span className="count">{list.length}</span>
      </h3>
      <div className="leaders">
        {leaders.length > 0 && (
          <>
            Trainiert von:{" "}
            {leaders.map((f, i) => (
              <span key={f.id}>
                {i > 0 && ", "}
                <b>{f.name}</b>
              </span>
            ))}
          </>
        )}
      </div>
      {!leaders.length && list.length > 0 && (
        <div className="warn">Keine anwesende Führungskraft für dieses Thema!</div>
      )}
      {sorted.length ? (
        sorted.map((t) => <TraineeChip key={t.id} t={t} themen={state.themen} />)
      ) : (
        <div className="empty">Niemand zugeordnet</div>
      )}
    </div>
  );
}

export default function TopicCards({ state, dispatch }) {
  const fkHere = state.fks.filter((f) => f.status === "anwesend");
  const placed = state.trainees.filter((t) => t.status === "anwesend" && t.thema);
  // Themen ohne Führungskraft und ohne Trainees blenden wir aus
  const cards = state.themen
    .map((th) => ({
      th,
      leaders: fkHere.filter((f) => f.thema === th),
      list: placed.filter((t) => t.thema === th),
    }))
    .filter((c) => c.leaders.length || c.list.length)
    .map((c) => ({ ...c, weight: 3 + c.list.length + (c.leaders.length > 3 ? 1 : 0) }));

  const render = ({ th, leaders, list }) => (
    <TopicCard key={th} thema={th} leaders={leaders} list={list} state={state} dispatch={dispatch} />
  );

  // Druck: die größte Karte zuerst, jede in die bisher kürzeste der 3 Spalten -> gleichmäßig gefüllte Seite
  const cols = [[], [], []];
  const heights = [0, 0, 0];
  [...cards]
    .sort((a, b) => b.weight - a.weight)
    .forEach((c) => {
      const i = heights.indexOf(Math.min(...heights));
      cols[i].push(c);
      heights[i] += c.weight;
    });

  return (
    <>
      <div className="grid">{cards.map(render)}</div>
      <div className="print-cols">
        {cols.map((col, i) => (
          <div className="pcol" key={i}>
            {col.map(render)}
          </div>
        ))}
      </div>
    </>
  );
}
