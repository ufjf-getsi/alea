export const DEFAULT_CENTER: [number, number] = [-21.7615, -43.3498]; // Juiz de Fora
export const DEFAULT_ZOOM = 13;

export type TileLayerConfig = {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom?: number;
  maxNativeZoom?: number;
  subdomains?: string | string[];
};

export const MAP_CACHE_TAG = "map";

// Add each tile provider's domain to the CSP 'img-src' directive to allow the map tiles to load
export const TILE_LAYERS: TileLayerConfig[] = [
  {
    id: "osm",
    name: "Ruas (OpenStreetMap)",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: "google-roadmap",
    name: "Ruas (Google)",
    url: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 20,
  },
  {
    id: "google-hybrid",
    name: "Satélite (Google)",
    url: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 20,
  },
  {
    id: "google-terrain",
    name: "Relevo (Google)",
    url: "https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 20,
  },
  {
    id: "opentopomap",
    name: "Topográfico (OpenTopoMap)",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; OpenStreetMap contributors, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    subdomains: "abc",
    maxZoom: 17,
  },
  {
    id: "esri-relief",
    name: "Relevo sombreado (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri",
    maxNativeZoom: 13,
    maxZoom: 19,
  },
  {
    id: "esri-imagery",
    name: "Satélite (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },

  // {
  //   id: "declividade",
  //   name: "Declividade",
  //   url: "http://mapasalea.engenharia.ws/mapas_matriciais/Declividade/{z}/{x}/{y}.png",
  //   attribution: "Mapas ALEA",
  //   maxZoom: 18,
  // },
];
