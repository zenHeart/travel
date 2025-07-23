export interface MapConfig {
  center: [number, number];
  zoom: number;
  style: string;
}

export interface CityMarker {
  id: string;
  position: [number, number];
  status: 'visited' | 'planned' | 'wishlist';
  name: string;
  data: Record<string, unknown>;
}

export interface MapState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  markers: CityMarker[];
  selectedMarker: CityMarker | null;
}

export interface MapEvent {
  type: 'marker-click' | 'map-click' | 'zoom-change' | 'pan-change';
  data?: Record<string, unknown>;
} 