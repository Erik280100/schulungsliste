import { initializeApp } from "firebase/app";
import { doc, initializeFirestore, onSnapshot, setDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

// Gemeinsamer Stand: ein Firestore-Dokument, der ganze State als JSON-String
// (vermeidet Probleme mit Sonderzeichen in Feldnamen wie "Thema|fkId").
export const cloudEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let ref = null;
if (cloudEnabled) {
  // Long-Polling-Autoerkennung: funktioniert auch hinter Proxys/Firewalls, die WebChannel-Streams blockieren
  const db = initializeFirestore(initializeApp(firebaseConfig), { experimentalAutoDetectLongPolling: true });
  ref = doc(db, "schulung", "state");
}

// callback(jsonString | null, { pending, fromCache }) – null = Dokument existiert noch nicht
export function subscribeCloud(callback, onError) {
  if (!ref) return () => {};
  return onSnapshot(
    ref,
    (snap) =>
      callback(snap.exists() ? snap.data().json : null, {
        pending: snap.metadata.hasPendingWrites,
        fromCache: snap.metadata.fromCache,
      }),
    onError,
  );
}

export function saveCloud(json) {
  if (!ref) return Promise.resolve();
  return setDoc(ref, { json, updatedAt: Date.now() });
}
