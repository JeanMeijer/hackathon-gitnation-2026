export const DEFAULT_VENUE_ADDRESS = "Gedempt Hamerkanaal 231, Amsterdam";

/** Venue entrance — tweak coordinates as needed. */
export const VENUE_ENTRANCE: [number, number] = [52.3833, 4.9204];

/** Inside the venue — placeholder offset from entrance. */
export const VENUE_DESTINATION: [number, number] = [52.38335, 4.92045];

export const MAP_CENTER = VENUE_ENTRANCE;
export const MAP_ZOOM = 17;

export const MAP_MARKERS = [
  { latlng: VENUE_ENTRANCE, name: "Start" },
  { latlng: VENUE_DESTINATION, name: "Destination" },
];

export const MAP_TILE_ATTRIBUTION = "© OpenStreetMap contributors";
