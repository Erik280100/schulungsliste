import { useEffect, useReducer, useState } from "react";
import { loadState, saveState } from "./data.js";
import { reducer } from "./reducer.js";
import Header from "./components/Header.jsx";
import LeaderBar from "./components/LeaderBar.jsx";
import TopicCards from "./components/TopicCards.jsx";
import TraineeGroups from "./components/TraineeGroups.jsx";
import { Absent, Unassigned } from "./components/Pools.jsx";
import Stammdaten from "./components/Stammdaten.jsx";
import { unledTrainees } from "./components/common.jsx";

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => saveState(state), [state]);
  const [checked, setChecked] = useState(false); // erst nach "Planung abschließen" prüfen
  const unled = unledTrainees(state);

  return (
    <main>
      {checked && (
        <div className={unled.length ? "attention" : "attention ok"} role="alert">
          <span>
            {unled.length ? (
              <>
                <b>Achtung:</b> Nicht alle Trainees sind zugeteilt – für ihr Thema ist keine Führungskraft
                eingeteilt: {unled.map((t) => `${t.name} (${t.thema})`).join(", ")}
              </>
            ) : (
              <>
                <b>Alles in Ordnung:</b> Jedes Thema mit Trainees hat eine Führungskraft.
              </>
            )}
          </span>
          <button onClick={() => setChecked(false)} aria-label="Schließen">
            ✕
          </button>
        </div>
      )}
      <Header state={state} dispatch={dispatch} onFinish={() => setChecked(true)} />

      <h2>1 · Führungskräfte: Thema zuteilen</h2>
      <LeaderBar state={state} dispatch={dispatch} />

      <h2>2 · Trainees: Thema zuteilen</h2>
      <TraineeGroups state={state} dispatch={dispatch} checked={checked} />

      <h2>3 · Ergebnis: Wer wird von wem in welchem Thema trainiert</h2>
      <TopicCards state={state} dispatch={dispatch} checked={checked} />

      <h2>Noch nicht eingeteilt</h2>
      <Unassigned state={state} />

      <h2>Abwesend (nicht in den Summen)</h2>
      <Absent state={state} />

      <Stammdaten state={state} dispatch={dispatch} />
    </main>
  );
}
