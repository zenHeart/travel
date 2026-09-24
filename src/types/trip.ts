export type TripStatus = 'visited' | 'planned' | 'wishlist';

export interface TripDocument {
  name: string;
  slug: string;
  title: string;
  content: string;
  order: number;
  kind: 'trip' | 'city' | 'note';
  cityName?: string;
  coordinates?: [number, number];
}

export interface TripMapPoint {
  id: string;
  label: string;
  coordinates: [number, number];
  status: TripStatus;
  path: string;
  tripId: string;
  tripTitle: string;
}

export interface Trip {
  id: string;
  title: string;
  status: TripStatus;
  startDate?: string;
  startYear?: string;
  dateHint?: string;
  index: TripDocument;
  pages: TripDocument[];
  points: TripMapPoint[];
}
