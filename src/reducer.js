import { SPECIAL, defaultState, newId } from "./data.js";

const upd = (list, id, patch) => list.map((x) => (x.id === id ? { ...x, ...patch } : x));

export function reducer(s, a) {
  switch (a.type) {
    case "replace":
      return a.state;
    case "resetDay":
      return {
        ...s,
        fks: s.fks.map((f) => ({ ...f, thema: null, status: "anwesend" })),
        trainees: s.trainees.map((t) => ({ ...t, thema: null, status: "anwesend" })),
      };
    case "resetAll":
      return defaultState();

    // Dropdown-Auswahl: "Fehlt", "Nicht bearbeitet", "Anwesend" oder ein Thema
    case "setValue": {
      const v = a.value;
      const patch =
        v === "Fehlt"
          ? { status: "fehlt", thema: null }
          : SPECIAL.includes(v)
            ? { status: "anwesend", thema: null, marker: v }
            : { status: "anwesend", thema: v };
      return { ...s, [a.list]: upd(s[a.list], a.id, patch) };
    }

    case "fk":
      return { ...s, fks: upd(s.fks, a.id, a.patch) };
    case "fkAdd":
      return { ...s, fks: [...s.fks, { id: newId("f"), name: "Neu", thema: null, status: "anwesend" }] };
    case "fkDel":
      return { ...s, fks: s.fks.filter((f) => f.id !== a.id) };

    case "tr":
      return { ...s, trainees: upd(s.trainees, a.id, a.patch) };
    case "trAdd":
      return {
        ...s,
        trainees: [
          ...s.trainees,
          { id: newId("t"), name: "Neu", gruppe: a.gruppe, thema: null, status: "anwesend" },
        ],
      };
    case "trDel":
      return { ...s, trainees: s.trainees.filter((t) => t.id !== a.id) };

    case "themaAdd":
      return { ...s, themen: [...s.themen, `Neues Thema ${s.themen.length + 1}`] };
    case "themaRename": {
      const old = s.themen[a.index];
      const nu = a.name.trim();
      if (!nu || s.themen.includes(nu)) return s;
      const re = (x) => (x.thema === old ? { ...x, thema: nu } : x);
      return {
        ...s,
        themen: s.themen.map((t, i) => (i === a.index ? nu : t)),
        fks: s.fks.map(re),
        trainees: s.trainees.map(re),
      };
    }
    case "themaDel": {
      const old = s.themen[a.index];
      const clear = (x) => (x.thema === old ? { ...x, thema: null } : x);
      return {
        ...s,
        themen: s.themen.filter((_, i) => i !== a.index),
        fks: s.fks.map(clear),
        trainees: s.trainees.map(clear),
      };
    }
    default:
      return s;
  }
}
