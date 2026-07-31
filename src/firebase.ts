import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { Student, ActiveParty, PartyAttendee, PartyGiftLog } from './types';
import { INITIAL_STUDENTS_TEMPLATE } from './data';

const LOCAL_STORAGE_PARTY_KEY = 'cyber_island_active_party_v1';

export function getLocalActiveParty(): ActiveParty | null {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_PARTY_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('LocalStorage party error:', e);
  }
  return null;
}

export function saveLocalActiveParty(party: ActiveParty | null) {
  try {
    if (party) {
      localStorage.setItem(LOCAL_STORAGE_PARTY_KEY, JSON.stringify(party));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_PARTY_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage save party error:', e);
  }
}

// Subscribe to Active Party in Firebase
export function subscribeActiveParty(onPartyChange: (party: ActiveParty | null) => void) {
  const partyRef = ref(db, 'activeParty');
  let isSubscribed = true;

  try {
    const unsubscribe = onValue(
      partyRef,
      (snapshot) => {
        if (!isSubscribed) return;
        const data = snapshot.val();
        if (data && typeof data === 'object' && data.isActive) {
          saveLocalActiveParty(data);
          onPartyChange(data);
        } else {
          saveLocalActiveParty(null);
          onPartyChange(null);
        }
      },
      (error) => {
        console.warn('Firebase party sync warning, falling back to local storage:', error.message);
        if (isSubscribed) {
          onPartyChange(getLocalActiveParty());
        }
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  } catch (err) {
    console.warn('Firebase party init exception');
    onPartyChange(getLocalActiveParty());
    return () => { isSubscribed = false; };
  }
}

// Host creates a party
export async function createActiveParty(party: ActiveParty): Promise<boolean> {
  saveLocalActiveParty(party);
  try {
    await set(ref(db, 'activeParty'), party);
    return true;
  } catch (e) {
    console.warn('Failed to publish active party to cloud, saved locally', e);
    return false;
  }
}

// Student joins active party
export async function joinActiveParty(attendee: PartyAttendee): Promise<boolean> {
  const localParty = getLocalActiveParty();
  if (localParty) {
    if (!localParty.attendees) localParty.attendees = {};
    localParty.attendees[attendee.studentId.toString()] = attendee;
    saveLocalActiveParty(localParty);
  }

  try {
    await set(ref(db, `activeParty/attendees/${attendee.studentId}`), attendee);
    return true;
  } catch (e) {
    console.warn('Failed to join party on cloud, updated locally', e);
    return false;
  }
}

// Student sends gift / flower to host during party
export async function sendPartyGiftLog(giftLog: PartyGiftLog): Promise<boolean> {
  const localParty = getLocalActiveParty();
  if (localParty) {
    if (!localParty.giftLogs) localParty.giftLogs = {};
    localParty.giftLogs[giftLog.id] = giftLog;
    saveLocalActiveParty(localParty);
  }

  try {
    await set(ref(db, `activeParty/giftLogs/${giftLog.id}`), giftLog);
    return true;
  } catch (e) {
    console.warn('Failed to send party gift on cloud', e);
    return false;
  }
}

// Close active party
export async function closeActiveParty(): Promise<boolean> {
  saveLocalActiveParty(null);
  try {
    await set(ref(db, 'activeParty'), null);
    return true;
  } catch (e) {
    console.warn('Failed to close party on cloud', e);
    return false;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyBttwmMBIQ6kQhVuwlXQd-cHraLc2lpSvo",
  authDomain: "b-building-house.firebaseapp.com",
  databaseURL: "https://b-building-house-default-rtdb.firebaseio.com",
  projectId: "b-building-house",
  storageBucket: "b-building-house.firebasestorage.app",
  messagingSenderId: "424985926497",
  appId: "1:424985926497:web:b82d67c05d985feb820320"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getDatabase(app);

const LOCAL_STORAGE_KEY = 'cyber_island_students_v6';

function sanitizeStudentsMap(map: Record<number, Student>): { sanitized: Record<number, Student>; wasModified: boolean } {
  let wasModified = false;
  const sanitized: Record<number, Student> = {};

  Object.entries(map).forEach(([key, student]) => {
    if (!student) return;
    const sId = Number(key);
    let s = { ...student };
    let sModified = false;

    let unlocked = new Set(s.unlocked || []);
    let unlockedArray = Array.from(unlocked);

    // If coins & petExp are 0, scrub legacy default unlocked IDs if present
    if ((s.coins === 0 || !s.coins) && (s.petExp === 0 || !s.petExp)) {
      const legacyDefaultIds = ['h1', 'v1', 'f1', 'p1', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15'];
      const hasOnlyLegacyDefaults = unlockedArray.length > 0 && unlockedArray.every(id => legacyDefaultIds.includes(id));
      if (hasOnlyLegacyDefaults) {
        unlocked.clear();
        unlockedArray = [];
        sModified = true;
      }
    }

    const hasUnlockedAvatar = unlockedArray.some(id => id.startsWith('a'));
    const hasUnlockedHouse = unlockedArray.some(id => id.startsWith('h'));
    const hasUnlockedVehicle = unlockedArray.some(id => id.startsWith('v'));
    const hasUnlockedFacility = unlockedArray.some(id => id.startsWith('f'));
    const hasUnlockedPet = unlockedArray.some(id => id.startsWith('p'));

    let equipped = {
      avatar: s.equipped?.avatar || '',
      house: s.equipped?.house || '',
      vehicle: s.equipped?.vehicle || '',
      facility: s.equipped?.facility || '',
      pet: s.equipped?.pet || '',
    };

    if (!hasUnlockedAvatar && equipped.avatar) {
      equipped.avatar = '';
      sModified = true;
    }
    if (!hasUnlockedHouse && equipped.house) {
      equipped.house = '';
      sModified = true;
    }
    if (!hasUnlockedVehicle && equipped.vehicle) {
      equipped.vehicle = '';
      sModified = true;
    }
    if (!hasUnlockedFacility && equipped.facility) {
      equipped.facility = '';
      sModified = true;
    }
    if (!hasUnlockedPet && equipped.pet) {
      equipped.pet = '';
      sModified = true;
    }

    if (sModified || unlockedArray.length !== (s.unlocked || []).length) {
      s.equipped = equipped;
      s.unlocked = unlockedArray;
      wasModified = true;
    }

    sanitized[sId] = s;
  });

  return { sanitized, wasModified };
}

// Get local initial map
export function getLocalStudents(): Record<number, Student> {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed: Record<number, Student> = JSON.parse(cached);
      const { sanitized, wasModified } = sanitizeStudentsMap(parsed);
      if (wasModified) {
        saveLocalStudents(sanitized);
      }
      return sanitized;
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  const initialMap: Record<number, Student> = {};
  INITIAL_STUDENTS_TEMPLATE.forEach(s => {
    initialMap[s.id] = s;
  });
  return initialMap;
}

// Save local
export function saveLocalStudents(map: Record<number, Student>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

// Realtime sync listener with LocalStorage fallback
export function subscribeStudents(onData: (data: Record<number, Student>, isOnline: boolean) => void) {
  const studentsRef = ref(db, 'students');
  let isSubscribed = true;

  try {
    const unsubscribe = onValue(
      studentsRef,
      (snapshot) => {
        if (!isSubscribed) return;
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          // Firebase return
          const { sanitized, wasModified } = sanitizeStudentsMap(data);
          saveLocalStudents(sanitized);
          if (wasModified) {
            set(studentsRef, sanitized).catch(() => {});
          }
          onData(sanitized, true);
        } else {
          // If empty in cloud, initialize cloud with default
          const localMap = getLocalStudents();
          set(studentsRef, localMap).catch(() => {});
          onData(localMap, true);
        }
      },
      (error) => {
        console.warn('Firebase sync warning, falling back to local storage:', error.message);
        if (isSubscribed) {
          onData(getLocalStudents(), false);
        }
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  } catch (err) {
    console.warn('Firebase init exception, fallback to local storage mode');
    onData(getLocalStudents(), false);
    return () => { isSubscribed = false; };
  }
}

// Sync helper that updates Firebase RTDB and LocalStorage
export async function syncStudentUpdate(studentId: number, partialData: Partial<Student>): Promise<boolean> {
  const localMap = getLocalStudents();
  if (localMap[studentId]) {
    localMap[studentId] = { ...localMap[studentId], ...partialData };
    saveLocalStudents(localMap);
  }

  try {
    await update(ref(db, `students/${studentId}`), partialData);
    return true;
  } catch (e) {
    console.warn(`Cloud update failed for student ${studentId}, saved locally`, e);
    return false;
  }
}

// Sync helper for entire students map (e.g. reset)
export async function syncAllStudents(map: Record<number, Student>): Promise<boolean> {
  saveLocalStudents(map);
  try {
    await set(ref(db, 'students'), map);
    return true;
  } catch (e) {
    console.warn('Cloud batch update failed, saved locally', e);
    return false;
  }
}
