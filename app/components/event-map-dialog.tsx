"use client";

import { useCallback, useEffect, useRef, type ComponentRef } from "react";
import { Path } from "@progress/kendo-drawing";
import { Dialog } from "@progress/kendo-react-dialogs";
import {
  Map as KendoMap,
  MapLayers,
  MapMarkerLayer,
  MapShapeLayer,
  MapTileLayer,
  type MapClickEvent,
  type PanEndEvent,
  type PanEvent,
  type ResetEvent,
  type ZoomEndEvent,
  type ZoomStartEvent,
} from "@progress/kendo-react-map";
import {
  MAP_CENTER,
  MAP_MARKERS,
  MAP_TILE_ATTRIBUTION,
  MAP_ZOOM,
  VENUE_DESTINATION,
  VENUE_ENTRANCE,
  VENUE_ROUTE_WAYPOINT,
} from "@/lib/map/venue-location";

interface EventMapDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

function tileUrl(args: { x: number; y: number; zoom: number }) {
  return `https://tile.openstreetmap.org/${args.zoom}/${args.x}/${args.y}.png`;
}

function locationToCoords(location: { lat: number; lng: number } | undefined) {
  if (!location) {
    return undefined;
  }

  return { lat: location.lat, lng: location.lng };
}

function getMapViewState(map: ResetEvent["target"]) {
  const core = map.mapInstance;
  if (!core) {
    return {};
  }

  const center = core.center();
  const extent = core.extent();

  return {
    center: locationToCoords(center),
    zoom: core.zoom(),
    extent: extent
      ? {
          nw: locationToCoords(extent.nw),
          se: locationToCoords(extent.se),
        }
      : undefined,
  };
}

function logMapView(
  eventName: string,
  map: ResetEvent["target"],
  extra?: Record<string, unknown>,
) {
  console.log(`[EventMap] ${eventName}`, {
    ...getMapViewState(map),
    ...extra,
  });
}

function drawRoute(map: ResetEvent["target"]) {
  const shapeLayer = map.layers.find((layer) => layer.surface);
  if (!shapeLayer?.surface) {
    return;
  }

  const from = map.locationToView(VENUE_ENTRANCE);
  const waypoint = map.locationToView(VENUE_ROUTE_WAYPOINT);
  const to = map.locationToView(VENUE_DESTINATION);
  if (!from || !waypoint || !to) {
    return;
  }

  const line = new Path({
    stroke: {
      color: "rgba(0, 0, 0, 0.55)",
      width: 3,
      dashType: "dot",
    },
  });

  line.moveTo(from).lineTo(waypoint).lineTo(to);
  shapeLayer.surface.draw(line);
}

export default function EventMapDialog({
  open,
  onClose,
  title,
}: EventMapDialogProps) {
  const mapRef = useRef<ComponentRef<typeof KendoMap>>(null);

  const handleReset = useCallback((event: ResetEvent) => {
    logMapView("reset", event.target);
    drawRoute(event.target);
  }, []);

  const handlePan = useCallback((event: PanEvent) => {
    logMapView("pan", event.target, {
      origin: locationToCoords(event.origin),
      center: locationToCoords(event.center),
    });
  }, []);

  const handlePanEnd = useCallback((event: PanEndEvent) => {
    logMapView("panEnd", event.target, {
      origin: locationToCoords(event.origin),
      center: locationToCoords(event.center),
    });
  }, []);

  const handleZoomStart = useCallback((event: ZoomStartEvent) => {
    logMapView("zoomStart", event.target);
  }, []);

  const handleZoomEnd = useCallback((event: ZoomEndEvent) => {
    logMapView("zoomEnd", event.target);
  }, []);

  const handleMapClick = useCallback((event: MapClickEvent) => {
    const coords = locationToCoords(event.location);
    if (!coords) {
      return;
    }

    console.log("[EventMap] click coords", {
      lat: coords.lat,
      lng: coords.lng,
      latlng: [coords.lat, coords.lng],
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      mapRef.current?.refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) {
    return null;
  }

  const dialogTitle = title ? `Map · ${title}` : "Map";

  return (
    <Dialog
      title={dialogTitle}
      onClose={onClose}
      width="min(calc(100vw - 2rem), 720px)"
      height="min(90dvh, 90vh)"
      className="event-map-dialog"
      contentStyle={{
        overflow: "hidden",
        padding: 0,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="event-map-dialog__map-shell">
        <KendoMap
          ref={mapRef}
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          pannable
          zoomable={false}
          wraparound={false}
          controls={{ zoom: false, navigator: false }}
          className="event-map-dialog__map"
          onReset={handleReset}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          onZoomStart={handleZoomStart}
          onZoomEnd={handleZoomEnd}
          onMapClick={handleMapClick}
        >
          <MapLayers>
            <MapShapeLayer />
            <MapTileLayer
              urlTemplate={tileUrl}
              attribution={MAP_TILE_ATTRIBUTION}
            />
            <MapMarkerLayer
              data={MAP_MARKERS.filter((marker) => marker.name === "Destination")}
              locationField="latlng"
              titleField="name"
            />
            <MapMarkerLayer
              data={MAP_MARKERS.filter((marker) => marker.name === "Start")}
              locationField="latlng"
              titleField="name"
              template={() =>
                `<span class="event-map-marker-dot" aria-hidden="true"></span>`
              }
            />
          </MapLayers>
        </KendoMap>
      </div>
    </Dialog>
  );
}
