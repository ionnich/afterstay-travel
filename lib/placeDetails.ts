import { getPlaceDetails as apiGetPlaceDetails } from './api';

export interface Review {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  relativeTime: string;
  text: string;
}

export interface PlaceDetails {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  totalReviews?: number;
  priceLevel?: number;
  openingHours?: string[];
  isOpenNow?: boolean;
  photos: string[];
  reviews: Review[];
  coords?: { lat: number; lng: number };
}

// Serves the rich place-detail sheet. Delegates to the server-side Places API
// (no bundled Google key); photos come back as full URLs. Fields the API does
// not return (coords, isOpenNow, authorPhoto, totalReviews) are left undefined.
export const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  const raw = await apiGetPlaceDetails(placeId);
  if (!raw) return null;

  return {
    name: raw.name,
    address: raw.formatted_address,
    phone: raw.formatted_phone_number,
    website: raw.website,
    rating: raw.rating,
    priceLevel: raw.price_level,
    openingHours: raw.opening_hours?.weekday_text,
    photos: raw.photos,
    reviews: (raw.reviews ?? []).map((rv) => ({
      authorName: rv.author_name,
      rating: rv.rating,
      relativeTime: rv.relative_time_description,
      text: rv.text,
    })),
  };
};
