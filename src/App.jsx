import { useEffect, useReducer } from "react";
import { loadState, saveState } from "./data.js";
import { reducer } from "./reducer.js";
import Header from "./components/Header.jsx";
import LeaderBar from "./components/LeaderBar.jsx";
import TopicCards from "./components/TopicCards.jsx";
import { Absent, Unassigned } from "./components/Pools.jsx";
import Stammdaten from "./components/Stammdaten.jsx";

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => saveState(state), [state]);

  return (
    <main>
      <Header state={state} dispatch={dispatch} />

      <h2>Führungskräfte</h2>
      <LeaderBar state={state} dispatch={dispatch} />

      <h2>Themen – wer trainiert wen</h2>
      <TopicCards state={state} dispatch={dispatch} />

      <h2>Noch nicht eingeteilt</h2>
      <Unassigned state={state} dispatch={dispatch} />

      <h2>Abwesend (nicht in den Summen)</h2>
      <Absent state={state} />

      <Stammdaten state={state} dispatch={dispatch} />
    </main>
  );
}
