// Anonymous trip session: client-only localStorage, 7-day expiry.
// Lets logged-out visitors accumulate saved hotels, tool outputs, and a
// pending trip name before they create an account.

const KEY_ID = "rtg_session_id";
const KEY_DATA = "rtg_session_data";
const KEY_EXPIRY = "rtg_session_expiry";
const KEY_RETURN_BANNER_DISMISSED = "rtg_return_banner_dismissed";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type AnonSavedHotel = {
  slug: string;
  property_name: string;
  location?: string;
  overall_rating?: number;
  saved_at: number;
};

export type AnonToolOutput = {
  kind: "itinerary" | "gear" | "best-time" | "safety" | "intel" | "currency" | "flights" | "destination";
  destination?: string;
  title?: string;
  payload?: unknown;
  created_at: number;
};

export type TripSessionData = {
  trip_name?: string;
  destination?: string;
  email?: string;
  saved_hotels: AnonSavedHotel[];
  tool_outputs: AnonToolOutput[];
  created_at: number;
  prompt_shown_at?: number;
  prompt_completed_at?: number;
};

const empty = (): TripSessionData => ({
  saved_hotels: [],
  tool_outputs: [],
  created_at: Date.now(),
});

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function refreshExpiry(): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_EXPIRY, String(Date.now() + SEVEN_DAYS_MS));
}

function isExpired(): boolean {
  if (!isBrowser()) return true;
  const raw = localStorage.getItem(KEY_EXPIRY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  return Number.isFinite(ts) && ts < Date.now();
}

/** Wipe all rtg_ session keys. */
export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_ID);
  localStorage.removeItem(KEY_DATA);
  localStorage.removeItem(KEY_EXPIRY);
  localStorage.removeItem(KEY_RETURN_BANNER_DISMISSED);
}

/** Read the current anonymous session, creating one lazily on first write. */
export function getSession(): TripSessionData {
  if (!isBrowser()) return empty();
  if (isExpired()) {
    clearSession();
    return empty();
  }
  const raw = localStorage.getItem(KEY_DATA);
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw) as TripSessionData;
    if (!parsed.saved_hotels) parsed.saved_hotels = [];
    if (!parsed.tool_outputs) parsed.tool_outputs = [];
    return parsed;
  } catch {
    return empty();
  }
}

function persist(data: TripSessionData): void {
  if (!isBrowser()) return;
  if (!localStorage.getItem(KEY_ID)) localStorage.setItem(KEY_ID, uuid());
  localStorage.setItem(KEY_DATA, JSON.stringify(data));
  refreshExpiry();
}

export function getSessionId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(KEY_ID);
}

export function setTripName(name: string): TripSessionData {
  const data = getSession();
  data.trip_name = name.trim();
  persist(data);
  return data;
}

export function setDestination(destination: string): TripSessionData {
  const data = getSession();
  if (!data.destination) data.destination = destination;
  persist(data);
  return data;
}

export function setEmail(email: string): TripSessionData {
  const data = getSession();
  data.email = email.trim().toLowerCase();
  persist(data);
  return data;
}

export function addSavedHotel(hotel: Omit<AnonSavedHotel, "saved_at">): TripSessionData {
  const data = getSession();
  if (!data.saved_hotels.some((h) => h.slug === hotel.slug)) {
    data.saved_hotels.unshift({ ...hotel, saved_at: Date.now() });
  }
  if (!data.destination && hotel.location) data.destination = hotel.location;
  persist(data);
  return data;
}

export function addToolOutput(output: Omit<AnonToolOutput, "created_at">): TripSessionData {
  const data = getSession();
  data.tool_outputs.unshift({ ...output, created_at: Date.now() });
  if (!data.destination && output.destination) data.destination = output.destination;
  persist(data);
  return data;
}

export function markPromptShown(): void {
  const data = getSession();
  if (!data.prompt_shown_at) data.prompt_shown_at = Date.now();
  persist(data);
}

export function markPromptCompleted(): void {
  const data = getSession();
  data.prompt_completed_at = Date.now();
  persist(data);
}

/** True when an unauthenticated visitor has a non-empty session that has not expired. */
export function isReturning(): boolean {
  if (!isBrowser()) return false;
  if (isExpired()) return false;
  const data = getSession();
  return data.saved_hotels.length > 0 || data.tool_outputs.length > 0 || !!data.trip_name;
}

export function isReturnBannerDismissed(): boolean {
  if (!isBrowser()) return true;
  return localStorage.getItem(KEY_RETURN_BANNER_DISMISSED) === "1";
}

export function dismissReturnBanner(): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_RETURN_BANNER_DISMISSED, "1");
}

/** Touch the session expiry on each app load so active visitors stay logged-in to the local plan. */
export function touchSession(): void {
  if (!isBrowser()) return;
  if (isExpired()) {
    clearSession();
    return;
  }
  if (localStorage.getItem(KEY_DATA)) refreshExpiry();
}

/** Has the save-moment prompt ever fired this session. */
export function hasSeenSavePrompt(): boolean {
  return !!getSession().prompt_shown_at;
}
