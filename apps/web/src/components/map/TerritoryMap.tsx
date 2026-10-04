import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DELHI_TERRITORIES, type TerritoryMetadata } from '@saafsafari/game-rules';
import { Truck, ShieldCheck, Flame, Compass, Layers } from 'lucide-react';
import { api } from '../../services/api';

interface TerritoryMapProps {
  onSelectTerritory: (territory: TerritoryMetadata) => void;
  selectedTerritoryId?: string | null;
}

// Convert game-rules territories into a GeoJSON FeatureCollection
function generateTerritoryGeoJson(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: DELHI_TERRITORIES.map((t) => {
      // MapLibre requires [lng, lat] coordinates and closed ring
      const coordinates = t.boundary.map(([lat, lng]) => [lng, lat]);
      if (coordinates.length > 0) {
        coordinates.push(coordinates[0]); // close the polygon ring
      }
      return {
        type: 'Feature',
        id: t.h3Index,
        properties: {
          id: t.h3Index,
          name: t.name,
          ward: t.ward,
          mascot: t.mascot,
          health: t.health,
          mood: t.mood,
          cleanIndex: t.cleanIndex,
          centerLat: t.centerLat,
          centerLng: t.centerLng,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      };
    }),
  };
}

export const TerritoryMap: React.FC<TerritoryMapProps> = ({
  onSelectTerritory,
  selectedTerritoryId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [trucks, setTrucks] = useState<any[]>([]);
  const truckMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Fetch live trucks
  useEffect(() => {
    let mounted = true;
    api.getLiveTrucks().then((res) => {
      if (mounted && res?.trucks) {
        setTrucks(res.trucks);
      }
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dark vector Carto basemap for sleek tactical game feel
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [77.2090, 28.6139], // Delhi NCR center
      zoom: 11.2,
      minZoom: 9.5,
      maxZoom: 16,
      pitch: 25, // Subtle 3D tilt
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      const geoJson = generateTerritoryGeoJson();

      // 1. Add GeoJSON Source
      map.addSource('delhi-territories', {
        type: 'geojson',
        data: geoJson,
      });

      // 2. Add Fill Layer with Dynamic Health/Mood Colors
      map.addLayer({
        id: 'territories-fill',
        type: 'fill',
        source: 'delhi-territories',
        paint: {
          'fill-color': [
            'case',
            ['<', ['get', 'health'], 50],
            '#EF4444', // Sick (Coral Red)
            ['<', ['get', 'health'], 75],
            '#F59E0B', // Recovering (Amber)
            ['<', ['get', 'health'], 90],
            '#10B981', // Thriving (Emerald)
            '#8B5CF6', // Legendary (Royal Violet)
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.65,
            0.35,
          ],
        },
      });

      // 3. Add Border Line Layer
      map.addLayer({
        id: 'territories-border',
        type: 'line',
        source: 'delhi-territories',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#38BDF8', // Sky blue for selected
            ['boolean', ['feature-state', 'hover'], false],
            '#FFFFFF',
            'rgba(255, 255, 255, 0.25)',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            ['boolean', ['feature-state', 'hover'], false],
            2,
            1,
          ],
        },
      });

      // 4. Interactive Hover & Click
      let hoveredStateId: string | number | null = null;

      map.on('mousemove', 'territories-fill', (e) => {
        if (e.features && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          if (hoveredStateId !== null) {
            map.setFeatureState(
              { source: 'delhi-territories', id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId = e.features[0].id ?? null;
          if (hoveredStateId !== null) {
            map.setFeatureState(
              { source: 'delhi-territories', id: hoveredStateId },
              { hover: true },
            );
          }
        }
      });

      map.on('mouseleave', 'territories-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
          map.setFeatureState(
            { source: 'delhi-territories', id: hoveredStateId },
            { hover: false },
          );
        }
        hoveredStateId = null;
      });

      map.on('click', 'territories-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties;
          const territory = DELHI_TERRITORIES.find((t) => t.h3Index === props?.id);
          if (territory) {
            onSelectTerritory(territory);
          }
        }
      });

      setMapLoaded(true);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update selected territory feature-state
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    DELHI_TERRITORIES.forEach((t) => {
      mapRef.current?.setFeatureState(
        { source: 'delhi-territories', id: t.h3Index },
        { selected: t.h3Index === selectedTerritoryId },
      );
    });
  }, [selectedTerritoryId, mapLoaded]);

  // Render Live Collection Trucks
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear previous markers
    truckMarkersRef.current.forEach((m) => m.remove());
    truckMarkersRef.current = [];

    // Fallback default trucks if backend returns empty list
    const activeTrucks =
      trucks.length > 0
        ? trucks
        : [
            { id: 'dl-01', name: 'DL-01-ET-1001', lat: 28.5588, lng: 77.2124, territory: 'Green Park' },
            { id: 'dl-02', name: 'DL-01-ET-1002', lat: 28.6328, lng: 77.2195, territory: 'Connaught Place' },
            { id: 'dl-03', name: 'DL-01-ET-1003', lat: 28.5494, lng: 77.2528, territory: 'Nehru Place' },
          ];

    activeTrucks.forEach((truck) => {
      const el = document.createElement('div');
      el.className = 'flex items-center gap-1.5 px-2 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 rounded-full shadow-lg text-xs font-semibold backdrop-blur cursor-pointer hover:scale-110 transition-transform';
      el.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>🚚 ${truck.name || 'MCD Truck'}</span>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([truck.lng || truck.longitude, truck.lat || truck.latitude])
        .addTo(mapRef.current!);

      truckMarkersRef.current.push(marker);
    });
  }, [trucks, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[600px]" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-5 left-5 glass-panel p-3.5 rounded-xl shadow-xl z-10 flex flex-col gap-2 max-w-xs text-xs">
        <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-white/10 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" /> Delhi NCR Territories (61 H3 Wards)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-glow"></span>
            <span className="text-slate-300 font-medium">Thriving (75–89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span className="text-slate-300 font-medium">Legendary (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-300 font-medium">Recovering (50–74%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-slate-300 font-medium">Sick (&lt; 50%)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-white/10 pt-1.5">
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time MCD collection trucks streaming GPS</span>
        </div>
      </div>
    </div>
  );
};
