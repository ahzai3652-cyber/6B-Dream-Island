export interface EquippedItems {
  avatar: string;
  house: string;
  vehicle: string;
  facility: string;
  pet: string;
}

export interface PartyAttendee {
  studentId: number;
  studentName: string;
  avatar: string;
  joinedAt: number;
}

export interface PartyGiftLog {
  id: string;
  fromId: number;
  fromName: string;
  fromAvatar: string;
  giftType: string;
  giftName: string;
  giftIcon: string;
  amount: number;
  timestamp: number;
}

export interface ActiveParty {
  hostId: number;
  hostName: string;
  hostAvatar: string;
  hostHouse: string;
  hostVehicle: string;
  hostFacility: string;
  title: string;
  startTime: number;
  isActive: boolean;
  attendees?: Record<string, PartyAttendee>;
  giftLogs?: Record<string, PartyGiftLog>;
}

export interface Student {
  id: number;
  name: string;
  code: string;
  coins: number;
  flowers: number;
  petExp: number;
  equipped: EquippedItems;
  unlocked: string[];
  lastCheckIn?: string; // YYYY-MM-DD
  streak?: number;
  receivedFlowers?: { from: string; count?: number; message: string; timestamp: number }[];
  footballHighScore?: number;
  lastFootballPlayedDate?: string; // YYYY-MM-DD
  gardenProgress?: number; // 0 to 100
  gardenFlowerType?: string; // e.g. '🌷' | '🌸' | '🌻' | '🌹' | '🌺'
  stamps?: number;
  drawRewards?: string[];
  lastDrawDate?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  description?: string;
  hatchedName?: string;
  hatchedIcon?: string;
  requiredExp?: number;
}

export type ShopCategoryKey = 'houses' | 'vehicles' | 'facilities' | 'pets' | 'avatars';

export interface UserSession {
  isTeacher: boolean;
  id?: number;
  name: string;
}
