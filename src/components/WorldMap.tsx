import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteStop, ROUTE_STOPS, StopId, CargoState } from '../types/route';
import { Play, CheckCircle2, Lock, RotateCcw, BookOpen, Volume2, VolumeX, Layers, Compass, Globe, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';

interface WorldMapProps {
  cargo: CargoState;
  onSelectStop: (stopId: StopId) => void;
  onOpenSources: () => void;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

type MapTheme = 'voyager' | 'satellite' | 'dark';

// Generate intermediate curved points between two lat/lngs for graceful flight/shipping arcs
function generateArcPoints(
  start: [number, number],
  end: [number, number],
  numPoints: number = 30
): [number, number][] {
  const [lat1, lon1] = start;
  let [lat2, lon2] = end;

  // Handle trans-Pacific longitude wrapping (e.g., China/Taiwan -> North America)
  if (lon1 > 90 && lon2 < -60) {
    lon2 += 360;
  }

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    // Linear interpolation of lat and lon
    let lat = lat1 + (lat2 - lat1) * f;
    let lon = lon1 + (lon2 - lon1) * f;

    // Add a natural arc bowing upwards/northwards based on distance
    const arcBowing = Math.sin(Math.PI * f) * 12;
    lat = Math.min(82, lat + arcBowing);

    // Normalize lon back to [-180, 180] if wrapped
    if (lon > 180) {
      lon -= 360;
    }

    points.push([lat, lon]);
  }
  return points;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  cargo,
  onSelectStop,
  onOpenSources,
  onReset,
  isMuted,
  onToggleMute
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeTheme, setActiveTheme] = useState<MapTheme>('voyager');
  const [inspectedStopId, setInspectedStopId] = useState<StopId>(cargo.currentStopId);

  // Sync inspected stop when cargo progresses
  useEffect(() => {
    setInspectedStopId(cargo.currentStopId);
  }, [cargo.currentStopId]);

  // Tile layer URL maps
  const TILE_PROVIDERS: Record<MapTheme, { url: string; attribution: string; subdomains?: string[] }> = {
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: ['a', 'b', 'c', 'd']
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: ['a', 'b', 'c', 'd']
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize with bounds centered over Eurasian-Pacific supply chain corridor
    const map = L.map(mapContainerRef.current, {
      center: [34, 70],
      zoom: 3,
      minZoom: 2,
      maxZoom: 16,
      worldCopyJump: true,
      zoomControl: false
    });

    // Add zoom control in top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Initial base tile layer
    const provider = TILE_PROVIDERS[activeTheme];
    const initialTiles = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains || ['a', 'b', 'c', 'd'],
      maxZoom: 18
    }).addTo(map);
    tileLayerRef.current = initialTiles;

    // Layer group for markers and route paths
    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;

    mapInstanceRef.current = map;

    // Initial bounds fit to all stops
    const bounds = L.latLngBounds(ROUTE_STOPS.map(s => s.latLng));
    map.fitBounds(bounds, { padding: [60, 60] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[activeTheme];
    const newTiles = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains || ['a', 'b', 'c', 'd'],
      maxZoom: 18
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [activeTheme]);

  // Update Markers, Routes, and Active Nodes
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    group.clearLayers();

    // 1. Draw connecting route arcs between consecutive stops
    for (let i = 0; i < ROUTE_STOPS.length - 1; i++) {
      const fromStop = ROUTE_STOPS[i];
      const toStop = ROUTE_STOPS[i + 1];
      const arcPoints = generateArcPoints(fromStop.latLng, toStop.latLng, 35);

      const isCompletedLeg = cargo.completedStops.includes(toStop.id);
      const isActiveLeg = cargo.currentStopId === toStop.id;

      // Glow backdrop for active/completed legs
      if (isCompletedLeg || isActiveLeg) {
        L.polyline(arcPoints, {
          color: isCompletedLeg ? '#10b981' : '#f59e0b',
          weight: 6,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(group);
      }

      // Foreground route path
      L.polyline(arcPoints, {
        color: isCompletedLeg
          ? '#059669'
          : isActiveLeg
          ? '#d97706'
          : activeTheme === 'dark'
          ? '#64748b'
          : '#94a3b8',
        weight: isActiveLeg ? 3.5 : 2.5,
        opacity: isActiveLeg ? 1.0 : isCompletedLeg ? 0.9 : 0.65,
        dashArray: isCompletedLeg ? undefined : '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);
    }

    // 2. Draw Stop Markers with custom HTML DivIcons
    ROUTE_STOPS.forEach(stop => {
      const isCompleted = cargo.completedStops.includes(stop.id);
      const isCurrent = cargo.currentStopId === stop.id;
      const isInspected = inspectedStopId === stop.id;
      const isLocked = stop.id > cargo.currentStopId && !isCompleted;

      // Custom HTML Pin
      const iconHtml = `
        <div class="relative flex items-center justify-center transform transition-transform duration-200 ${
          isInspected ? 'scale-125 z-50' : 'hover:scale-115'
        }">
          ${
            isCurrent
              ? `<div class="absolute -inset-2 bg-amber-400 rounded-full animate-ping opacity-60"></div>`
              : ''
          }
          <div class="relative w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xl border-2 transition-all ${
            isCurrent
              ? 'bg-amber-400 text-stone-950 border-white ring-4 ring-amber-500/50 shadow-amber-500/50'
              : isCompleted
              ? 'bg-emerald-600 text-white border-white shadow-emerald-700/50'
              : 'bg-stone-700 text-stone-300 border-stone-500 opacity-85'
          }">
            ${
              isCompleted
                ? `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>`
                : isLocked
                ? `<svg class="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2.5"/></svg>`
                : `<span>${stop.id}</span>`
            }
          </div>
          <div class="absolute -bottom-6 px-1.5 py-0.5 bg-stone-950/90 text-amber-200 border border-stone-700 rounded text-[9px] font-mono whitespace-nowrap shadow-md pointer-events-none">
            ${stop.location}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker(stop.latLng, { icon: customIcon }).addTo(group);

      // Marker click behavior
      marker.on('click', () => {
        sound.playSelect();
        setInspectedStopId(stop.id);
        if (!isLocked || isCompleted) {
          map.flyTo(stop.latLng, Math.max(map.getZoom(), 5), { duration: 0.8 });
        }
      });
    });
  }, [cargo, inspectedStopId, activeTheme]);

  // Fit view to entire global route
  const handleFitRoute = () => {
    sound.playSelect();
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds(ROUTE_STOPS.map(s => s.latLng));
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
  };

  // Fly to active stop
  const handleFocusActiveStage = () => {
    sound.playSelect();
    if (!mapInstanceRef.current) return;
    const active = ROUTE_STOPS.find(s => s.id === cargo.currentStopId) || ROUTE_STOPS[0];
    mapInstanceRef.current.flyTo(active.latLng, 6, { duration: 1.2 });
    setInspectedStopId(active.id);
  };

  const inspectedStop = ROUTE_STOPS.find(s => s.id === inspectedStopId) || ROUTE_STOPS[0];
  const isInspectedCompleted = cargo.completedStops.includes(inspectedStop.id);
  const isInspectedLocked = inspectedStop.id > cargo.currentStopId && !isInspectedCompleted;

  return (
    <div className="flex flex-col h-full bg-[#1e232a] text-stone-100 select-none overflow-hidden font-sans">
      {/* Top Header: Semiconductor Flight Ribbon */}
      <header className="px-6 py-3 bg-[#181c22] text-stone-200 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-stone-950 font-black shadow-md text-xs font-mono tracking-tighter">
            CHIP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white rounded font-mono">
                REAL WORLD ROUTE
              </span>
              <span className="text-xs text-amber-300 font-mono">
                LOT #{cargo.lotId}
              </span>
              <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                &bull; 7-Stop Semiconductor Journey
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
              One Chip, One Road — Global Supply Chain Map
            </h1>
          </div>
        </div>

        {/* Global Controls & Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onToggleMute();
              sound.playSelect();
            }}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg border border-stone-700 shadow-xs transition cursor-pointer"
            title={isMuted ? 'Unmute procedural sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onOpenSources();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg shadow-xs transition cursor-pointer font-mono"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>SOURCES.md</span>
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              if (window.confirm('Reset this journey to a fresh batch at Stop 1?')) {
                onReset();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-800 rounded-lg shadow-xs transition cursor-pointer font-mono"
            title="Reset to fresh run"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </header>

      {/* Main Map Viewport & Real Geographic Canvas */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-between p-3 sm:p-5">
        {/* Real World Map Container */}
        <div className="w-full h-full min-h-[44vh] max-h-[58vh] bg-stone-900 border-2 border-stone-700/80 rounded-2xl relative overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Leaflet DOM Mounting Container */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Layer and Camera Controls Overlay (Top Right) */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2 pointer-events-auto">
            {/* Theme switcher */}
            <div className="bg-stone-950/85 backdrop-blur-md p-1 rounded-xl border border-stone-700/80 shadow-lg flex items-center gap-1 text-xs">
              <button
                onClick={() => {
                  sound.playSelect();
                  setActiveTheme('voyager');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeTheme === 'voyager'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
                title="Detailed cartographic map"
              >
                Voyager
              </button>
              <button
                onClick={() => {
                  sound.playSelect();
                  setActiveTheme('satellite');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeTheme === 'satellite'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
                title="True satellite Earth imagery"
              >
                Satellite
              </button>
              <button
                onClick={() => {
                  sound.playSelect();
                  setActiveTheme('dark');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeTheme === 'dark'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
                title="Dark command room map"
              >
                Dark
              </button>
            </div>

            {/* Camera Quick Action Buttons */}
            <div className="flex items-center gap-1.5 bg-stone-950/85 backdrop-blur-md p-1 rounded-xl border border-stone-700/80 shadow-lg text-xs">
              <button
                onClick={handleFitRoute}
                className="flex items-center gap-1 px-2.5 py-1 text-stone-200 hover:bg-stone-800 rounded-lg font-mono transition cursor-pointer"
                title="Fit entire global route on screen"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fit Route</span>
              </button>
              <button
                onClick={handleFocusActiveStage}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-mono transition cursor-pointer"
                title="Fly camera to current active stage"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Stage 0{cargo.currentStopId}</span>
              </button>
            </div>
          </div>

          {/* Quick Route Progress Indicator (Bottom Left of Map) */}
          <div className="absolute bottom-3 left-3 z-10 bg-stone-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-700/80 shadow-lg flex items-center gap-2 pointer-events-auto">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">
              Progress:
            </span>
            <div className="flex items-center gap-1">
              {ROUTE_STOPS.map(s => {
                const isDone = cargo.completedStops.includes(s.id);
                const isNow = cargo.currentStopId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      sound.playSelect();
                      setInspectedStopId(s.id);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(s.latLng, 6);
                      }
                    }}
                    className={`w-5 h-5 rounded-md text-[10px] font-bold font-mono flex items-center justify-center transition cursor-pointer ${
                      isNow
                        ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                    }`}
                    title={`${s.id}. ${s.name} (${s.location})`}
                  >
                    {s.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Current/Inspected Stop Information Card & Navigation */}
        <div className="mt-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-stone-800 text-amber-400 text-[10px] font-bold font-mono rounded border border-stone-700">
                  STAGE 0{inspectedStop.id} OF 07
                </span>
                <span className="text-sm font-bold text-white">
                  {inspectedStop.location}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Coordinates: {inspectedStop.latLng[0].toFixed(2)}°N, {inspectedStop.latLng[1].toFixed(2)}°E
                </span>
                <span className="text-xs text-stone-500 font-mono hidden md:inline">
                  Sources: {inspectedStop.sources.join(', ')}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white">
                {inspectedStop.name}:{' '}
                <span className="font-normal text-stone-300">
                  {inspectedStop.purpose}
                </span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {inspectedStop.summary}
              </p>
            </div>

            {/* Action button to enter production workspace */}
            <div className="flex items-center gap-3 shrink-0">
              {isInspectedLocked ? (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 text-stone-400 font-medium text-xs rounded-xl border border-stone-700">
                  <Lock className="w-4 h-4 text-stone-500" />
                  <span>Locked until Stage 0{cargo.currentStopId} completes</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playSelect();
                    onSelectStop(inspectedStop.id);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Play className="w-4 h-4 fill-stone-950" />
                  <span>
                    {inspectedStop.id === 7
                      ? 'Enter Ending & Unboxing'
                      : isInspectedCompleted
                      ? 'Review 3D Workspace'
                      : 'Enter 3D Workspace'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mandatory Map Legend Disclaimer as required by GUIDELINES.md Section 4 */}
        <div className="mt-2 text-center text-[11px] text-stone-400 font-mono">
          Note: This is a representative teaching scenario grounded in real regional activities. It is <strong>not</strong> a documented supplier itinerary for an actual iPhone chip.
        </div>
      </div>
    </div>
  );
};
