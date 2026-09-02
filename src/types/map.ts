import { City } from "./city";

export interface MapConfig {
  center: [number, number];
  zoom: number;
  style: string;
}

export interface CityMarker {
  data: City;
  marker: unknown;
  // 该点位的跳转路径：城市为 /city/:id，子地点为 /city/:id/:slug
  path: string;
  // 点位显示名（子地点用自己的名字，而不是所属城市名）
  label: string;
}

export interface MapState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  markers: CityMarker[];
  selectedMarker: CityMarker | null;
}

export interface MapEvent {
  type: "marker-click" | "map-click" | "zoom-change" | "pan-change";
  data?: Record<string, unknown>;
}
