import { initializeApp } from "firebase/app";
import { doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

// Gemeinsamer Stand: ein Firestore-Dokument, der ganze State als JSON-String
// (vermeidet Probleme mit Sonderzeichen in Feldnamen wie "Thema|fkId").
export const cloudEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let ref = null;
if (cloudEnabled) {
  ref = doc(getFirestore(initializeApp(firebaseConfig)), "schulung", "state");
}

// callback(jsonString | null, fromLocalWrite) – null = Dokument existiert noch nicht
export function subscribeCloud(callback, onError) {
  if (!ref) return () => {};
  return onSnapshot(
    ref,
    (snap) => callback(snap.exists() ? snap.data().json : null, snap.metadata.hasPendingWrites),
    onError,
  );
}

export function saveCloud(json) {
  if (!ref) return Promise.resolve();
  return setDoc(ref, { json, updatedAt: Date.now() });
}
