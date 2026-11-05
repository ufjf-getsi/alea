"use client";

import { LayersControl, TileLayer } from "react-leaflet";
import { TILE_LAYERS } from "@/lib/maps/mapConfig";

export function BaseLayers() {
  return (
    <LayersControl position="topright">
      {TILE_LAYERS.map((layer, index) => (
        <LayersControl.BaseLayer
          key={layer.id}
          name={layer.name}
          checked={index === 0}
        >
          <TileLayer
            url={layer.url}
            attribution={layer.attribution}
            maxZoom={layer.maxZoom}
            maxNativeZoom={layer.maxNativeZoom}
            {...(layer.subdomains ? { subdomains: layer.subdomains } : {})}
          />
        </LayersControl.BaseLayer>
      ))}
    </LayersControl>
  );
}
