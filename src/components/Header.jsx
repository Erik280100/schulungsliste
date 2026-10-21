import { useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { exportExcel } from "../exportExcel.js";

export default function Header({ state, dispatch, onFinish }) {
  const fileRef = useRef(null);
  const [askReset, setAskReset] = useState(false);
  const here = state.trainees.filter((t) => t.status === "anwesend");
  const placed = here.filter((t) => t.thema);
  const fkHere = state.fks.filter((f) => f.status === "anwesend");

  const stats = [
    [state.trainees.length, "Trainees gesamt"],
    [here.length, "anwesend"],
    [placed.length, "eingeteilt"],
    [here.length - placed.length, "ohne Thema"],
    [`${fkHere.length}/${state.fks.length}`, "Führungskräfte da"],
  ];

  const exportJson = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    a.download = `schulung-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importJson = async (e) => {
    try {
      const d = JSON.parse(await e.target.files[0].text());
      if (!d.themen || !d.fks || !d.trainees) throw new Error("ungültig");
      dispatch({ type: "replace", state: d });
    } catch {
      alert("Datei ist keine gültige Schulungs-Datei.");
    }
    e.target.value = "";
  };

  const resetDay = () => {
    setAskReset(false);
    dispatch({ type: "resetDay" });
  };

  return (
    <header className="top">
      <h1>Schulungs-Einteilung</h1>
      <div className="stats">
        {stats.map(([n, l]) => (
          <div className="stat" key={l}>
            <b>{n}</b>
            <span>{l}</span>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <button className="primary" onClick={onFinish}>
          Planung abschließen
        </button>
        <button onClick={() => exportExcel(state)}>Excel</button>
        <button onClick={exportJson}>Export</button>
        <button onClick={() => fileRef.current.click()}>Import</button>
        <button onClick={() => window.print()}>Drucken</button>
        <button onClick={() => setAskReset(true)}>Tag zurücksetzen</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
      </div>
      {askReset && (
        <ConfirmDialog
          title="Alle Daten zurücksetzen?"
          confirmLabel="Ja, zurücksetzen"
          onConfirm={resetDay}
          onCancel={() => setAskReset(false)}
        >
          Möchten Sie wirklich alle Daten zurücksetzen? Alle Themen-Zuordnungen und Anwesenheiten gehen verloren.
        </ConfirmDialog>
      )}
    </header>
  );
}
