"use client";

import { useCallback } from "react";
import { Path } from "@progress/kendo-drawing";
import { Dialog } from "@progress/kendo-react-dialogs";
import {
  Map,
  MapLayers,
  MapMarkerLayer,
  MapShapeLayer,
  MapTileLayer,
  type ResetEvent,
} from "@progress/kendo-react-map";
import {
  MAP_CENTER,
  MAP_MARKERS,
  MAP_TILE_ATTRIBUTION,
  MAP_ZOOM,
  VENUE_DESTINATION,
  VENUE_ENTRANCE,
} from "@/lib/map/venue-location";

interface EventMapDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

function tileUrl(args: { x: number; y: number; zoom: number }) {
  return `https://tile.openstreetmap.org/${args.zoom}/${args.x}/${args.y}.png`;
}

function drawRoute(map: ResetEvent["target"]) {
  const shapeLayer = map.layers.find((layer) => layer.surface);
  if (!shapeLayer?.surface) {
    return;
  }

  const from = map.locationToView(VENUE_ENTRANCE);
  const to = map.locationToView(VENUE_DESTINATION);
  if (!from || !to) {
    return;
  }

  const line = new Path({
    stroke: {
      color: "rgba(0, 0, 0, 0.55)",
      width: 3,
      dashType: "dot",
    },
  });

  line.moveTo(from).lineTo(to);
  shapeLayer.surface.draw(line);
}

export default function EventMapDialog({
  open,
  onClose,
  title,
}: EventMapDialogProps) {
  const handleReset = useCallback((event: ResetEvent) => {
    drawRoute(event.target);
  }, []);

  if (!open) {
    return null;
  }

  const dialogTitle = title ? `Map · ${title}` : "Map";

  return (
    <Dialog
      title={dialogTitle}
      onClose={onClose}
      width="min(calc(100vw - 2rem), 720px)"
      className="event-map-dialog-window"
      contentStyle={{ overflow: "hidden", padding: 0 }}
    >
      <div className="event-map-dialog">
        <Map
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          pannable={false}
          zoomable={false}
          controls={{ zoom: false, navigator: false, attribution: true }}
          onReset={handleReset}
        >
          <MapLayers>
            <MapShapeLayer />
            <MapTileLayer
              urlTemplate={tileUrl}
              attribution={MAP_TILE_ATTRIBUTION}
            />
            <MapMarkerLayer
              data={MAP_MARKERS}
              locationField="latlng"
              titleField="name"
            />
          </MapLayers>
        </Map>
      </div>
    </Dialog>
  );
}
