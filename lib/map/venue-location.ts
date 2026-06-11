export const DEFAULT_VENUE_ADDRESS = "Gedempt Hamerkanaal 199, Amsterdam";

/** Venue entrance — tweak coordinates as needed. */
export const VENUE_ENTRANCE: [number, number] = [
  52.38206344626761, 4.921220830174489,
];

/** Inside the venue — placeholder offset from entrance. */
export const VENUE_DESTINATION: [number, number] = [
  52.38263065638761, 4.920482981715665,
];

/** Waypoints along the route between start and destination. */
export const VENUE_ROUTE_WAYPOINTS: [number, number][] = [
  [52.38206579974548, 4.920905429635512],
  [52.382656467561915, 4.920732280470759],
];

export const MAP_CENTER: [number, number] = [
  52.38242444655531, 4.920726249692955,
];
export const MAP_ZOOM = 19;

export const MAP_MARKERS = [
  { latlng: VENUE_ENTRANCE, name: "Start" },
  { latlng: VENUE_DESTINATION, name: "Destination" },
];

export const MAP_TILE_ATTRIBUTION = "© OpenStreetMap contributors";
