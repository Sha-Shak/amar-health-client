import { openDB, type DBSchema } from "idb";

// §6/Design System §6 — the emergency pass is the one piece of data in this app
// that has to survive being read with zero network, on the patient's own device,
// so it lives in IndexedDB rather than the normal TanStack Query cache. Written
// once at generate-time (Settings, online); read at view-time with no network
// call at all — see /emergency-pass/[token]/page.tsx.
export type EmergencyPassData = {
  shareToken: string;
  name?: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact?: { name?: string; relationship?: string; phone?: string };
  generatedAt: string;
};

interface EmergencyPassDB extends DBSchema {
  pass: {
    key: "current";
    value: EmergencyPassData;
  };
}

function getDb() {
  return openDB<EmergencyPassDB>("smart-health-vault-emergency-pass", 1, {
    upgrade(db) {
      db.createObjectStore("pass");
    },
  });
}

export async function saveEmergencyPass(data: EmergencyPassData): Promise<void> {
  const db = await getDb();
  await db.put("pass", data, "current");
}

export async function readEmergencyPass(): Promise<EmergencyPassData | undefined> {
  const db = await getDb();
  return db.get("pass", "current");
}
