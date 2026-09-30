// AWS data layer — drop-in replacement for lib/supabase.ts.
// Every exported function preserves the original signature so consumer
// files only need to change their import path. Data CRUD goes to the Rust
// `api` Lambda under `/v1/data/...`; AI/Places/Weather go to the
// `integrations` Lambda under `/v1/integrations/...`. Auth is a Cognito JWT
// fetched via `getAccessToken()` from `./auth`.

import { CONFIG } from './config'
import { getAccessToken } from './auth'
import { compressImage } from './compressImage'

import type {
  AIRecommendation,
  AutocompleteResult,
  ChecklistItem,
  Expense,
  Flight,
  GroupMember,
  Highlight,
  ItineraryDay,
  LifetimeStats,
  Moment,
  NearbyPlace,
  PackingItem,
  Place,
  PlaceDetails,
  PlaceVote,
  PlannerPace,
  PlannerScope,
  ScannedReceipt,
  ScannedTripDetails,
  Trip,
  TripFile,
} from './types'

// Re-export integration types so call sites can `import type { … } from '@/lib/api'`.
export type {
  ItineraryActivity,
  ItineraryDay,
  ItineraryDayLegacy,
  PlannerScope,
  PlannerPace,
  ReceiptLineItem,
  ScannedReceipt,
  ScannedTripDetails,
  NearbyPlace,
  PlaceDetails,
  AutocompleteResult,
} from './types'

// ---------- transport ----------

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getAccessToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let payload: string | undefined
  if (body !== undefined) {
    headers['content-type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(CONFIG.API_URL.replace(/\/$/, '') + path, {
    method,
    headers,
    body: payload,
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error?.message) message = data.error.message
      else if (data?.error) message = JSON.stringify(data.error)
    } catch {
      // non-JSON error body — keep the status message
    }
    throw new Error(message)
  }

  const text = await res.text()
  if (!text) return undefined as unknown as T
  return JSON.parse(text) as T
}

/** Fire a request whose response body is `{"ok":true}` (or empty) and discard it. */
async function requestVoid(method: string, path: string, body?: unknown): Promise<void> {
  await request<unknown>(method, path, body)
}

/** `POST /v1/data/presign` → `{ uploadUrl, key }` for a private S3 upload. */
async function presign(prefix: string, contentType: string): Promise<{ uploadUrl: string; key: string }> {
  return request<{ uploadUrl: string; key: string }>('POST', '/v1/data/presign', {
    prefix,
    contentType,
  })
}

/** PUT a blob directly to a presigned S3 upload URL. */
async function uploadToPresigned(uploadUrl: string, blob: Blob, contentType: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'content-type': contentType },
  })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
}

// Cache the active trip ID so trip-scoped functions that omit tripId do not
// fire a separate `getActiveTrip` query every time.
let cachedTripId: string | undefined

async function resolveTripId(tripId?: string): Promise<string> {
  if (tripId) return tripId
  if (cachedTripId) return cachedTripId
  const trip = await getActiveTrip()
  if (!trip) throw new Error('No active trip found and no tripId provided.')
  cachedTripId = trip.id
  return trip.id
}

// ---------- TRIPS ----------

export async function getActiveTrip(_forceRefresh = false): Promise<Trip | null> {
  const trip = await request<Trip | null>('GET', '/v1/data/trips/active')
  if (trip) cachedTripId = trip.id
  return trip
}

/** Clear the cached active-trip id (the only client-side cache this module keeps). */
export function clearTripCache() {
  cachedTripId = undefined
}

export async function createTrip(input: {
  name: string
  destination: string
  startDate: string
  endDate: string
  members?: string[]
  accommodation?: string
  address?: string
  checkIn?: string
  checkOut?: string
  roomType?: string
  bookingRef?: string
  cost?: number
  costCurrency?: string
}): Promise<string> {
  const { id } = await request<{ id: string }>('POST', '/v1/data/trips', input)
  cachedTripId = id
  return id
}

// ---------- TRIP INVITES ----------

export async function createInviteCode(tripId?: string): Promise<string> {
  const id = await resolveTripId(tripId)
  const { code } = await request<{ code: string }>('POST', '/v1/data/invites', { tripId: id })
  return code
}

export async function joinTripByCode(code: string, userName: string): Promise<{ tripId: string; trip: Trip }> {
  return request<{ tripId: string; trip: Trip }>('POST', '/v1/data/invites/join', { code, userName })
}

export interface TripInvite {
  id: string
  code: string
  createdAt: string
  expiresAt: string
  used: boolean
}

export async function getInvites(tripId?: string): Promise<TripInvite[]> {
  const id = await resolveTripId(tripId)
  return request<TripInvite[]>('GET', `/v1/data/invites?tripId=${encodeURIComponent(id)}`)
}

// ---------- FLIGHTS ----------

export async function addFlight(input: {
  tripId: string
  direction: 'Outbound' | 'Return'
  flightNumber: string
  airline?: string
  fromCity?: string
  toCity?: string
  departTime?: string
  arriveTime?: string
  bookingRef?: string
  passenger?: string
}): Promise<void> {
  await requestVoid('POST', `/v1/data/trips/${input.tripId}/flights`, input)
}

export async function getFlights(tripId?: string): Promise<Flight[]> {
  const id = await resolveTripId(tripId)
  return request<Flight[]>('GET', `/v1/data/trips/${id}/flights`)
}

// ---------- GROUP CHAT ----------

export interface ChatMessage {
  id: string
  tripId: string
  senderName: string
  senderAvatar?: string
  message: string
  createdAt: string
}

export async function getChatMessages(tripId?: string): Promise<ChatMessage[]> {
  const id = await resolveTripId(tripId)
  return request<ChatMessage[]>('GET', `/v1/data/trips/${id}/chat`)
}

export async function sendChatMessage(input: {
  tripId?: string
  senderName: string
  senderAvatar?: string
  message: string
}): Promise<void> {
  const id = await resolveTripId(input.tripId)
  await requestVoid('POST', `/v1/data/trips/${id}/chat`, {
    senderName: input.senderName,
    senderAvatar: input.senderAvatar,
    message: input.message,
  })
}

export function subscribeToChatMessages(
  tripId: string,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  let ws: WebSocket | undefined
  let closed = false
  ;(async () => {
    const token = await getAccessToken()
    if (closed) return
    ws = new WebSocket(`${CONFIG.WS_URL}?token=${token ?? ''}&tripId=${tripId}`)
    ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data) as ChatMessage)
      } catch {
        // ignore malformed frames
      }
    }
  })()

  return () => {
    closed = true
    ws?.close()
  }
}

// ---------- GROUP MEMBERS ----------

export async function addGroupMember(input: {
  tripId?: string
  name: string
  email?: string
  phone?: string
  role?: 'Primary' | 'Member'
}): Promise<void> {
  const id = await resolveTripId(input.tripId)
  await requestVoid('POST', `/v1/data/trips/${id}/members`, {
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: input.role,
  })
}

export async function getGroupMembers(tripId?: string): Promise<GroupMember[]> {
  const id = await resolveTripId(tripId)
  return request<GroupMember[]>('GET', `/v1/data/trips/${id}/members`)
}

export async function updateMemberPhoto(memberId: string, localUri: string): Promise<void> {
  const compressed = await compressImage(localUri, 400, 0.5)
  const filename = localUri.split('/').pop() ?? 'avatar.jpg'
  const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'

  const response = await fetch(compressed)
  const blob = await response.blob()
  const { uploadUrl, key } = await presign('avatars', contentType)
  await uploadToPresigned(uploadUrl, blob, contentType)

  await requestVoid('POST', `/v1/data/members/${memberId}/photo`, { key })
}

export async function updateMemberEmail(memberId: string, email: string): Promise<void> {
  await requestVoid('PATCH', `/v1/data/members/${memberId}/email`, { email })
}

export async function updateMemberPhone(memberId: string, phone: string): Promise<void> {
  await requestVoid('PATCH', `/v1/data/members/${memberId}/phone`, { phone })
}

// ---------- TRIP PROPERTIES ----------

export async function updateTripProperty(
  tripId: string,
  key: string,
  value: string,
): Promise<void> {
  await requestVoid('PATCH', `/v1/data/trips/${tripId}/property`, { key, value })
}

export async function updateTripBudgetMode(
  tripId: string,
  mode: 'Limited' | 'Unlimited',
): Promise<void> {
  await requestVoid('PATCH', `/v1/data/trips/${tripId}/budget-mode`, { mode })
}

export async function updateTripBudgetLimit(tripId: string, limit: number): Promise<void> {
  await requestVoid('PATCH', `/v1/data/trips/${tripId}/budget-limit`, { limit })
}

// ---------- PACKING ----------

export async function getPackingList(tripId?: string): Promise<PackingItem[]> {
  const id = await resolveTripId(tripId)
  return request<PackingItem[]>('GET', `/v1/data/trips/${id}/packing`)
}

export async function addPackingItem(
  input: Omit<PackingItem, 'id' | 'packed'> & { tripId?: string },
): Promise<void> {
  const id = await resolveTripId(input.tripId)
  await requestVoid('POST', `/v1/data/trips/${id}/packing`, {
    item: input.item,
    category: input.category,
    owner: input.owner,
  })
}

export async function togglePacked(itemId: string, packed: boolean): Promise<void> {
  await requestVoid('POST', `/v1/data/packing/${itemId}/toggle`, { packed })
}

// ---------- EXPENSES ----------

export async function getExpenses(tripId?: string): Promise<Expense[]> {
  const id = await resolveTripId(tripId)
  return request<Expense[]>('GET', `/v1/data/trips/${id}/expenses`)
}

export async function addExpense(
  input: Omit<Expense, 'id'> & { tripId?: string },
): Promise<void> {
  const id = await resolveTripId(input.tripId)
  await requestVoid('POST', `/v1/data/trips/${id}/expenses`, {
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    category: input.category,
    date: input.date,
    paidBy: input.paidBy,
    photo: input.photo,
    placeName: input.placeName,
    splitType: input.splitType,
    notes: input.notes,
  })
}

export async function updateExpense(
  expenseId: string,
  input: Partial<Omit<Expense, 'id'>>,
): Promise<void> {
  await requestVoid('PATCH', `/v1/data/expenses/${expenseId}`, {
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    category: input.category,
    date: input.date,
    paidBy: input.paidBy,
    photo: input.photo,
    placeName: input.placeName,
    splitType: input.splitType,
    notes: input.notes,
  })
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await requestVoid('DELETE', `/v1/data/expenses/${expenseId}`)
}

/**
 * Delete a row by ID. Kept for signature parity with lib/supabase.ts, but the
 * Rust API only exposes a delete route for expenses (`DELETE /v1/data/expenses/{id}`).
 */
export async function deletePage(rowId: string, table?: string): Promise<void> {
  if (table === 'expenses') {
    await requestVoid('DELETE', `/v1/data/expenses/${rowId}`)
    return
  }
  throw new Error('deletePage: the current API only supports deleting expenses.')
}

export async function getExpenseSummary(
  tripId?: string,
): Promise<{ total: number; byCategory: Record<string, number>; count: number }> {
  const id = await resolveTripId(tripId)
  return request<{ total: number; byCategory: Record<string, number>; count: number }>(
    'GET',
    `/v1/data/trips/${id}/expenses/summary`,
  )
}

// ---------- PLACES ----------

export async function getSavedPlaces(tripId?: string): Promise<Place[]> {
  const id = await resolveTripId(tripId)
  return request<Place[]>('GET', `/v1/data/trips/${id}/places`)
}

export async function addPlace(
  input: Omit<Place, 'id'> & { tripId?: string },
): Promise<void> {
  const id = await resolveTripId(input.tripId)
  await requestVoid('POST', `/v1/data/trips/${id}/places`, input)
}

export async function voteOnPlace(placeId: string, vote: PlaceVote): Promise<void> {
  await requestVoid('POST', `/v1/data/places/${placeId}/vote`, { vote })
}

export async function savePlace(placeId: string, saved: boolean): Promise<void> {
  await requestVoid('POST', `/v1/data/places/${placeId}/save`, { saved })
}

// ---------- CHECKLIST ----------

export async function getChecklist(tripId?: string): Promise<ChecklistItem[]> {
  const id = await resolveTripId(tripId)
  return request<ChecklistItem[]>('GET', `/v1/data/trips/${id}/checklist`)
}

// ---------- MOMENTS ----------

function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'heic':
      return 'image/heic'
    case 'mp4':
      return 'video/mp4'
    case 'mov':
      return 'video/quicktime'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'image/jpeg'
  }
}

export async function getMoments(tripId?: string): Promise<Moment[]> {
  const id = await resolveTripId(tripId)
  return request<Moment[]>('GET', `/v1/data/trips/${id}/moments`)
}

export async function addMoment(
  input: Omit<Moment, 'id'> & { tripId?: string; localUri?: string },
): Promise<void> {
  const tripId = await resolveTripId(input.tripId)

  let photo = input.photo
  if (input.localUri) {
    const rawExt = (input.localUri.split('.').pop() ?? 'jpg').toLowerCase()
    const isVideo = ['mp4', 'mov', 'avi', 'webm', 'm4v'].includes(rawExt)
    // Images are compressed to JPEG; videos upload as-is.
    const fileToUpload = isVideo ? input.localUri : await compressImage(input.localUri, 600, 0.6)
    const contentType = isVideo ? guessMimeType(input.localUri) : 'image/jpeg'

    const response = await fetch(fileToUpload)
    const blob = await response.blob()
    const { uploadUrl, key } = await presign('moments', contentType)
    await uploadToPresigned(uploadUrl, blob, contentType)
    photo = key
  }

  await requestVoid('POST', `/v1/data/trips/${tripId}/moments`, {
    caption: input.caption || 'Untitled',
    photo,
    location: input.location,
    takenBy: input.takenBy,
    date: input.date,
    tags: input.tags,
  })
}

// ---------- TRIP FILES ----------

export async function getTripFiles(tripId?: string): Promise<TripFile[]> {
  const id = await resolveTripId(tripId)
  return request<TripFile[]>('GET', `/v1/data/trips/${id}/files`)
}

export async function addTripFile(
  input: Omit<TripFile, 'id'> & { tripId?: string },
): Promise<void> {
  const tripId = await resolveTripId(input.tripId)

  // A pasted remote URL is stored as-is; a local file URI is uploaded to S3.
  let fileUrl = input.fileUrl
  if (fileUrl && !/^https?:\/\//.test(fileUrl)) {
    const contentType = guessMimeType(fileUrl)
    const response = await fetch(fileUrl)
    const blob = await response.blob()
    const { uploadUrl, key } = await presign('trip-files', contentType)
    await uploadToPresigned(uploadUrl, blob, contentType)
    fileUrl = key
  }

  await requestVoid('POST', `/v1/data/trips/${tripId}/files`, {
    fileName: input.fileName,
    fileUrl,
    type: input.type,
    notes: input.notes,
    printRequired: input.printRequired,
  })
}

// ---------- PROFILES ----------

export interface Profile {
  id: string
  fullName: string
  avatarUrl?: string
  phone?: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  return request<Profile | null>('GET', `/v1/data/profile/${encodeURIComponent(userId)}`)
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id'>>,
): Promise<void> {
  await requestVoid('PATCH', `/v1/data/profile/${encodeURIComponent(userId)}`, {
    fullName: updates.fullName,
    avatarUrl: updates.avatarUrl,
    phone: updates.phone,
  })
}

export async function ensureProfile(userId: string, name: string): Promise<void> {
  // The API derives the profile id from the caller's JWT; userId is ignored.
  await requestVoid('POST', '/v1/data/profile/ensure', { name })
}

// ---------- LIFETIME STATS & HIGHLIGHTS ----------

export async function getLifetimeStats(_userId: string): Promise<LifetimeStats | null> {
  return request<LifetimeStats | null>('GET', '/v1/data/stats/lifetime')
}

export async function getHighlights(_userId: string): Promise<Highlight[]> {
  return request<Highlight[]>('GET', '/v1/data/stats/highlights')
}

export async function getPastTrips(_userId: string): Promise<Trip[]> {
  return request<Trip[]>('GET', '/v1/data/trips/past')
}

// ---------- INTEGRATIONS (Anthropic / Places / Weather) ----------
// These mirror the client-side AI/Places helpers, but call the
// `integrations` Lambda so no secret keys ship in the bundle.

export async function generateRecommendations(args: {
  firstTime: 'First visit' | 'Been before' | 'Local-ish'
  interests: string[]
  trip?: { destination?: string; accommodation?: string; startDate?: string; endDate?: string; nights?: number }
  groupSize?: number
}): Promise<AIRecommendation[]> {
  return request<AIRecommendation[]>('POST', '/v1/integrations/anthropic/recommendations', args)
}

export async function generateItinerary(args: {
  scope: PlannerScope
  pace: PlannerPace
  interests: string[]
  tripDays?: number
  startDate?: string
  destination?: string
  hotelName?: string
  groupSize?: number
  budget?: number
  budgetCurrency?: string
}): Promise<ItineraryDay[]> {
  return request<ItineraryDay[]>('POST', '/v1/integrations/anthropic/itinerary', args)
}

export async function scanReceipt(base64Image: string, mimeType: string = 'image/jpeg'): Promise<ScannedReceipt> {
  return request<ScannedReceipt>('POST', '/v1/integrations/anthropic/receipt', {
    base64Image,
    mimeType,
  })
}

export async function scanTripDocuments(
  images: { base64: string; mimeType: string }[],
): Promise<ScannedTripDetails> {
  return request<ScannedTripDetails>('POST', '/v1/integrations/anthropic/scan-trip', { images })
}

export async function searchNearby(type?: string, keyword?: string): Promise<NearbyPlace[]> {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (keyword) params.set('keyword', keyword)
  const qs = params.toString()
  return request<NearbyPlace[]>('GET', `/v1/integrations/places/nearby${qs ? `?${qs}` : ''}`)
}

export async function placeAutocomplete(input: string): Promise<AutocompleteResult[]> {
  return request<AutocompleteResult[]>(
    'GET',
    `/v1/integrations/places/autocomplete?input=${encodeURIComponent(input)}`,
  )
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  return request<PlaceDetails | null>(
    'GET',
    `/v1/integrations/places/details?placeId=${encodeURIComponent(placeId)}`,
  )
}

export async function getPlaceLocation(
  placeId: string,
): Promise<{ name: string; lat: number; lng: number } | null> {
  return request<{ name: string; lat: number; lng: number } | null>(
    'GET',
    `/v1/integrations/places/location?placeId=${encodeURIComponent(placeId)}`,
  )
}

export async function enrichRecommendations<T extends { name: string }>(
  recs: T[],
): Promise<
  (T & {
    photoUri: string | null
    googleMapsUri: string | null
    googlePlaceId: string | null
    totalRatings: number
    lat: number
    lng: number
  })[]
> {
  return request<
    (T & {
      photoUri: string | null
      googleMapsUri: string | null
      googlePlaceId: string | null
      totalRatings: number
      lat: number
      lng: number
    })[]
  >('POST', '/v1/integrations/places/enrich', { recs })
}

/** Raw weatherapi.com forecast JSON (5 days) for the given location. */
export async function getWeatherForecast(location: string): Promise<{
  location: Record<string, unknown>
  current: Record<string, unknown>
  forecast: { forecastday: Record<string, unknown>[] }
}> {
  return request<{
    location: Record<string, unknown>
    current: Record<string, unknown>
    forecast: { forecastday: Record<string, unknown>[] }
  }>('GET', `/v1/integrations/weather?location=${encodeURIComponent(location)}`)
}
