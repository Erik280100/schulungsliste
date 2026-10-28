import { SPECIAL, defaultState, newId } from "./data.js";

const upd = (list, id, patch) => list.map((x) => (x.id === id ? { ...x, ...patch } : x));

// Raum-/Split-Schlüssel eines Themas: "T", "T|fkId", "FK|T"; nu = null löscht den Eintrag
function remapThema(obj, old, nu) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === old || k.startsWith(`${old}|`)) {
      if (nu !== null) out[nu + k.slice(old.length)] = v;
    } else if (k === `FK|${old}`) {
      if (nu !== null) out[`FK|${nu}`] = v;
    } else out[k] = v;
  }
  return out;
}

export function reducer(s, a) {
  switch (a.type) {
    case "replace":
      return a.state;
    case "resetDay":
      return {
        ...s,
        split: {},
        raeume: {},
        fks: s.fks.map((f) => ({ ...f, thema: null, rolle: "trainer", status: "anwesend", marker: "Nicht bearbeitet" })),
        trainees: s.trainees.map((t) => ({
          ...t,
          thema: null,
          fkId: null,
          status: "anwesend",
          marker: "Nicht bearbeitet",
        })),
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
      // neues Thema: Teilgruppen-Zuordnung gilt nicht mehr; ohne Thema ist eine FK wieder Trainer
      if (a.list === "trainees") patch.fkId = null;
      else if (!patch.thema) patch.rolle = "trainer";
      return { ...s, [a.list]: upd(s[a.list], a.id, patch) };
    }

    // Gruppe eines Themas auf die trainierenden FKs aufteilen (ganze Gruppen bleiben zusammen)
    case "split": {
      const trainers = s.fks.filter((f) => f.status === "anwesend" && f.thema === a.thema && f.rolle !== "teilnehmer");
      if (trainers.length < 2) return s;
      const byGroup = {};
      s.trainees
        .filter((t) => t.status === "anwesend" && t.thema === a.thema)
        .forEach((t) => (byGroup[t.gruppe] ||= []).push(t));
      const load = Object.fromEntries(trainers.map((f) => [f.id, 0]));
      const assign = {};
      Object.values(byGroup)
        .sort((x, y) => y.length - x.length)
        .forEach((g) => {
          const id = trainers.reduce((m, f) => (load[f.id] < load[m.id] ? f : m)).id;
          load[id] += g.length;
          g.forEach((t) => (assign[t.id] = id));
        });
      return {
        ...s,
        split: { ...s.split, [a.thema]: true },
        trainees: s.trainees.map((t) => (assign[t.id] ? { ...t, fkId: assign[t.id] } : t)),
      };
    }
    case "unsplit": {
      const { [a.thema]: _, ...split } = s.split;
      return {
        ...s,
        split,
        trainees: s.trainees.map((t) => (t.thema === a.thema ? { ...t, fkId: null } : t)),
      };
    }
    case "raum": {
      const raeume = { ...s.raeume };
      if (a.value.trim()) raeume[a.key] = a.value.trim();
      else delete raeume[a.key];
      return { ...s, raeume };
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
        split: remapThema(s.split, old, nu),
        raeume: remapThema(s.raeume, old, nu),
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
        split: remapThema(s.split, old, null),
        raeume: remapThema(s.raeume, old, null),
        fks: s.fks.map(clear),
        trainees: s.trainees.map(clear),
      };
    }
    default:
      return s;
  }
}
