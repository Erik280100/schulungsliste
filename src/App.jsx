import { useEffect, useReducer, useRef, useState } from "react";
import { loadState, normalize, saveState } from "./data.js";
import { cloudEnabled, saveCloud, subscribeCloud } from "./cloud.js";
import { reducer } from "./reducer.js";
import Header from "./components/Header.jsx";
import LeaderBar from "./components/LeaderBar.jsx";
import TopicCards from "./components/TopicCards.jsx";
import TraineeGroups from "./components/TraineeGroups.jsx";
import { Absent, Unassigned } from "./components/Pools.jsx";
import Stammdaten from "./components/Stammdaten.jsx";
import { unassignedFks, unledTrainees } from "./components/common.jsx";

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => saveState(state), [state]); // lokaler Cache

  // Gemeinsamer Stand über Firestore: Änderungen anderer erscheinen live, eigene werden gespeichert
  const remoteJson = useRef(null);
  const [cloudReady, setCloudReady] = useState(!cloudEnabled);
  const [sync, setSync] = useState(cloudEnabled ? "laden" : "lokal");
  useEffect(() => {
    if (!cloudEnabled) return undefined;
    // Kommt nach 8 s keine Antwort vom Server, ist meist die Datenbank nicht angelegt oder blockiert
    const timer = setTimeout(() => setSync((s) => (s === "laden" ? "offline" : s)), 8000);
    const unsub = subscribeCloud(
      (json, { pending, fromCache }) => {
        // Antwort nur aus dem Cache (Server nicht erreicht) nicht als "leer" werten
        if (fromCache && json === null) return;
        clearTimeout(timer);
        remoteJson.current = json;
        if (json !== null && !pending) dispatch({ type: "replace", state: normalize(JSON.parse(json)) });
        setCloudReady(true);
        setSync("ok");
      },
      (err) => {
        clearTimeout(timer);
        console.error("Firestore:", err);
        setSync(err.code === "permission-denied" ? "regeln" : "fehler");
      },
    );
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);
  useEffect(() => {
    if (!cloudEnabled || !cloudReady) return undefined;
    const json = JSON.stringify(state);
    if (json === remoteJson.current) return undefined;
    const t = setTimeout(() => {
      setSync("speichern");
      saveCloud(json)
        .then(() => {
          remoteJson.current = json;
          setSync("ok");
        })
        .catch(() => setSync("fehler"));
    }, 400);
    return () => clearTimeout(t);
  }, [state, cloudReady]);
  const [checked, setChecked] = useState(false); // erst nach "Planung abschließen" prüfen
  const unled = unledTrainees(state);
  const fkOpen = unassignedFks(state);
  const problem = unled.length > 0 || fkOpen.length > 0;

  return (
    <main>
      <div className={`sync sync-${sync}`} title="Speicherstatus">
        {{ lokal: "Nur lokal gespeichert", laden: "Lade gemeinsamen Stand …", speichern: "Speichere …", ok: "Gemeinsam gespeichert", fehler: "Speichern fehlgeschlagen", offline: "Keine Verbindung zu Firestore (Datenbank angelegt? Netz/Adblocker?)", regeln: "Zugriff verweigert – Firestore-Regeln prüfen" }[sync]}
      </div>
      {checked && (
        <div className={problem ? "attention" : "attention ok"} role="alert">
          <span>
            {problem ? (
              <>
                {fkOpen.length > 0 && (
                  <div>
                    <b>Achtung:</b> {fkOpen.length} {fkOpen.length === 1 ? "Führungskraft hat" : "Führungskräfte haben"}{" "}
                    noch kein Thema: {fkOpen.map((f) => f.name).join(", ")}
                  </div>
                )}
                {unled.length > 0 && (
                  <div>
                    <b>Achtung:</b> Nicht alle Trainees sind zugeteilt – für ihr Thema ist keine Führungskraft
                    eingeteilt: {unled.map((t) => `${t.name} (${t.thema})`).join(", ")}
                  </div>
                )}
              </>
            ) : (
              <>
                <b>Alles in Ordnung:</b> Alle Führungskräfte haben ein Thema, und jedes Thema mit Trainees hat eine
                Führungskraft.
              </>
            )}
          </span>
          <button onClick={() => setChecked(false)} aria-label="Schließen">
            ✕
          </button>
        </div>
      )}
      <Header state={state} dispatch={dispatch} onFinish={() => setChecked(true)} checked={checked} />

      <h2>1 · Führungskräfte: Thema zuteilen</h2>
      <LeaderBar state={state} dispatch={dispatch} checked={checked} />

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
