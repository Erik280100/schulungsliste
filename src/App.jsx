import { useEffect, useReducer } from "react";
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
  const unled = unledTrainees(state);

  return (
    <main>
      {unled.length > 0 && (
        <div className="attention" role="alert">
          <b>Achtung:</b> Nicht alle Trainees sind zugeteilt – für ihr Thema ist keine Führungskraft eingeteilt:{" "}
          {unled.map((t) => `${t.name} (${t.thema})`).join(", ")}
        </div>
      )}
      <Header state={state} dispatch={dispatch} />

      <h2>1 · Führungskräfte: Thema zuteilen</h2>
      <LeaderBar state={state} dispatch={dispatch} />

      <h2>2 · Trainees: Thema zuteilen</h2>
      <TraineeGroups state={state} dispatch={dispatch} />

      <h2>3 · Ergebnis: Wer wird von wem in welchem Thema trainiert</h2>
      <TopicCards state={state} dispatch={dispatch} />

      <h2>Noch nicht eingeteilt</h2>
      <Unassigned state={state} />

      <h2>Abwesend (nicht in den Summen)</h2>
      <Absent state={state} />

      <Stammdaten state={state} dispatch={dispatch} />
    </main>
  );
}
