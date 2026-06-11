export const DEFAULT_VENUE_ADDRESS = "Gedempt Hamerkanaal 199, Amsterdam";

/** Venue entrance — tweak coordinates as needed. */
export const VENUE_ENTRANCE: [number, number] = [52.38212, 4.92087];

/** Inside the venue — placeholder offset from entrance. */
export const VENUE_DESTINATION: [number, number] = [52.38205, 4.92095];

export const MAP_CENTER: [number, number] = [52.38212088131687, 4.920869234483681];
export const MAP_ZOOM = 18;

export const MAP_MARKERS = [
  { latlng: VENUE_ENTRANCE, name: "Start" },
  { latlng: VENUE_DESTINATION, name: "Destination" },
];

export const MAP_TILE_ATTRIBUTION = "© OpenStreetMap contributors";
