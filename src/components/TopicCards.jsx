import { useState } from "react";
import { FkChip, NameInput, TraineeChip, buildCards, colorOf } from "./common.jsx";

function TopicCard({ card, state, dispatch, checked }) {
  const { kind, thema, leaders, list, fkId, teil, raumKey } = card;
  const [over, setOver] = useState(false);
  const isFk = kind === "fk";
  const sorted = isFk ? list : [...list].sort((a, b) => a.gruppe.localeCompare(b.gruppe));
  const drop = (e) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    // in einer Teilgruppe landet der Trainee bei deren Trainer, sonst ohne Teilgruppe
    if (!isFk && state.trainees.some((t) => t.id === id)) {
      dispatch({ type: "tr", id, patch: { thema, fkId: fkId || null } });
    }
  };
  return (
    <div
      className={"card" + (over ? " over" : "")}
      style={{ "--c": colorOf(state.themen, thema) }}
      onDragOver={
        isFk
          ? undefined
          : (e) => {
              e.preventDefault();
              setOver(true);
            }
      }
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <h3>
        <span>
          {thema}
          {teil && <small className="sub"> · Gruppe {teil}</small>}
          {isFk && <small className="sub"> · Führungskräfte-Training</small>}
        </span>
        <span className="count">{list.length}</span>
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
      <label className="raum">
        <span>Raum</span>
        <NameInput
          value={state.raeume[raumKey] || ""}
          placeholder="Raum eintragen…"
          onCommit={(value) => dispatch({ type: "raum", key: raumKey, value })}
        />
      </label>
      {!isFk && !teil && leaders.length > 1 && (
        <button className="split no-print" onClick={() => dispatch({ type: "split", thema })}>
          Gruppe aufteilen ({leaders.length} Führungskräfte)
        </button>
      )}
      {teil && (
        <button className="split no-print" onClick={() => dispatch({ type: "unsplit", thema })}>
          Gruppen zusammenführen
        </button>
      )}
      {!leaders.length && list.length > 0 && (
        <div className="warn">Keine anwesende Führungskraft für dieses Thema!</div>
      )}
      {sorted.length ? (
        sorted.map((p) =>
          isFk ? (
            <FkChip key={p.id} f={p} themen={state.themen} alert={checked && !leaders.length} />
          ) : (
            <TraineeChip key={p.id} t={p} themen={state.themen} alert={checked && !leaders.length} />
          ),
        )
      ) : (
        <div className="empty">Niemand zugeordnet</div>
      )}
    </div>
  );
}

export default function TopicCards({ state, dispatch, checked }) {
  // Themen ohne Führungskraft und ohne Trainees blenden wir aus (siehe buildCards)
  const cards = buildCards(state).map((c) => ({
    ...c,
    weight: 3 + c.list.length + (c.leaders.length > 3 ? 1 : 0),
  }));

  const render = (card) => (
    <TopicCard key={card.raumKey} card={card} state={state} dispatch={dispatch} checked={checked} />
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
