// Eingabefelder speichern erst beim Verlassen (onBlur), damit das Tippen nicht jedes Mal neu rendert.
function NameInput({ value, onCommit }) {
  return (
    <input
      type="text"
      key={value}
      defaultValue={value}
      onBlur={(e) => e.target.value !== value && onCommit(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

export default function Stammdaten({ state, dispatch }) {
  const gruppen = [...new Set(state.trainees.map((t) => t.gruppe))];

  const addGroup = () => {
    const g = prompt("Name der Führungskraft / Gruppe:");
    if (g && g.trim()) dispatch({ type: "trAdd", gruppe: g.trim() });
  };

  return (
    <details>
      <summary>Stammdaten &amp; Themen verwalten</summary>

      <div className="group">
        <h4>Themen</h4>
        {state.themen.map((t, i) => (
          <div className="row" key={t}>
            <NameInput value={t} onCommit={(name) => dispatch({ type: "themaRename", index: i, name })} />
            <button onClick={() => dispatch({ type: "themaDel", index: i })}>Entfernen</button>
          </div>
        ))}
        <button onClick={() => dispatch({ type: "themaAdd" })}>+ Thema</button>
      </div>

      <div className="group">
        <h4>Führungskräfte</h4>
        {state.fks.map((f) => (
          <div className="row" key={f.id}>
            <NameInput value={f.name} onCommit={(name) => dispatch({ type: "fk", id: f.id, patch: { name } })} />
            <button onClick={() => dispatch({ type: "fkDel", id: f.id })}>Entfernen</button>
          </div>
        ))}
        <button onClick={() => dispatch({ type: "fkAdd" })}>+ Führungskraft</button>
      </div>

      {gruppen.map((g) => (
        <div className="group" key={g}>
          <h4>Gruppe von {g}</h4>
          {state.trainees
            .filter((t) => t.gruppe === g)
            .map((t) => (
              <div className="row" key={t.id}>
                <NameInput value={t.name} onCommit={(name) => dispatch({ type: "tr", id: t.id, patch: { name } })} />
                <button onClick={() => dispatch({ type: "trDel", id: t.id })}>Entfernen</button>
              </div>
            ))}
          <button onClick={() => dispatch({ type: "trAdd", gruppe: g })}>+ Trainee</button>
        </div>
      ))}
      <button onClick={addGroup}>+ Neue Gruppe</button>
    </details>
  );
}
