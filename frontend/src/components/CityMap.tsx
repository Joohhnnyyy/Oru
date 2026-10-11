import { useEffect, useRef, useState } from 'react';
import maplibregl, { type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { LiveTruck } from '@saafsafari/shared';
import type { CityMapResponse, HotspotItem, TruckTrail } from '../lib/api';
import { characterForHealth, TRUCK } from '../content/media';

export type MapSelection = { kind: 'territory' | 'bin' | 'truck' | 'hotspot'; id: string };
export function CityMap({ data, trucks, hotspots, trail, filter, onSelect }: {
  data: CityMapResponse; trucks: LiveTruck[]; hotspots: HotspotItem[]; trail: TruckTrail | null;
  filter: string; onSelect: (value: MapSelection) => void;
}) {
  const container = useRef<HTMLDivElement>(null), map = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const styleUrl = data.mapStyle?.styleUrl;
  useEffect(() => {
    if (!container.current || !styleUrl) return;
    let instance: maplibregl.Map;
    try {
      instance = new maplibregl.Map({ container: container.current, style: styleUrl, center: [77.22, 28.61], zoom: 11, pitch: 30 });
      map.current = instance;
      instance.addControl(new maplibregl.NavigationControl(), 'top-right');
      instance.on('load', () => { setReady(true); setFailed(false); });
      instance.on('error', () => setFailed(true));
    } catch { queueMicrotask(() => setFailed(true)); return; }
    return () => { setReady(false); map.current = null; instance.remove(); };
  }, [styleUrl]);
  useEffect(() => {
    const instance = map.current;
    if (!ready || !instance) return;
    const polygons = { type: 'FeatureCollection' as const, features: data.territories.map(t => {
      const ring = t.boundary.map(([lat, lng]) => [lng, lat]);
      return { type: 'Feature' as const, properties: { health: t.health }, geometry: { type: 'Polygon' as const, coordinates: [[...ring, ring[0]]] } };
    }) };
    if (instance.getSource('territories')) (instance.getSource('territories') as GeoJSONSource).setData(polygons);
    else {
      instance.addSource('territories', { type: 'geojson', data: polygons });
      instance.addLayer({ id: 'territory-fill', type: 'fill', source: 'territories', paint: { 'fill-color': ['interpolate', ['linear'], ['get', 'health'], 0, '#ff8f96', 50, '#ffd768', 100, '#65d5b1'], 'fill-opacity': 0.28 } });
      instance.addLayer({ id: 'territory-outline', type: 'line', source: 'territories', paint: { 'line-color': '#258e79', 'line-width': 2 } });
      const bounds = new maplibregl.LngLatBounds();
      data.territories.forEach(t => t.boundary.forEach(([lat, lng]) => bounds.extend([lng, lat])));
      if (!bounds.isEmpty()) instance.fitBounds(bounds, { padding: 65, duration: 0, maxZoom: 14 });
    }
  }, [ready, data]);
  useEffect(() => {
    const instance = map.current;
    if (!ready || !instance) return;
    const markers: maplibregl.Marker[] = [];
    const add = (kind: MapSelection['kind'], id: string, name: string, lat: number, lng: number, image?: string, status?: string) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `oru-map-marker ${status === 'idle' ? 'is-idle' : ''}`;
      button.setAttribute('aria-label', name); button.title = name;
      if (image) { const img = document.createElement('img'); img.src = image; img.alt = ''; button.append(img); }
      else { button.textContent = kind === 'bin' ? '♻' : '!'; button.dataset.status = status || ''; }
      button.onclick = () => onSelect({ kind, id });
      markers.push(new maplibregl.Marker({ element: button }).setLngLat([lng, lat]).addTo(instance));
    };
    if (filter === 'All' || filter === 'Territories') data.territories.forEach(t => add('territory', t.territoryId, `${t.name}: ${t.guardian.name}, health ${t.health}`, t.center.latitude, t.center.longitude, characterForHealth(t.guardian.id, t.health)));
    if (filter === 'All' || filter === 'Dustbins') data.bins.forEach(b => add('bin', b.sourceId, `${b.name}: ${b.status.replaceAll('_', ' ')}`, b.latitude, b.longitude, undefined, b.status));
    if (filter === 'All' || filter === 'Trucks') trucks.forEach(t => add('truck', t.sourceId, `${t.name}: ${t.status === 'active' ? 'Live GPS' : 'Registered location'}`, t.latitude, t.longitude, TRUCK.hero, t.status));
    if (filter === 'All' || filter === 'Hotspots') hotspots.filter(h => h.status !== 'RESOLVED').forEach(h => add('hotspot', h.hotspotId, h.title, h.latitude, h.longitude));
    return () => markers.forEach(m => m.remove());
  }, [ready, data, trucks, hotspots, filter, onSelect]);
  useEffect(() => {
    const instance = map.current;
    if (!ready || !instance) return;
    const line = { type: 'FeatureCollection' as const, features: trail && trail.points.length > 1 ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: trail.points.map(p => [p.longitude, p.latitude]) } }] : [] };
    if (instance.getSource('trail')) (instance.getSource('trail') as GeoJSONSource).setData(line);
    else { instance.addSource('trail', { type: 'geojson', data: line }); instance.addLayer({ id: 'truck-trail', type: 'line', source: 'trail', paint: { 'line-color': '#1188bc', 'line-width': 5 } }); }
  }, [ready, trail]);
  return <><div ref={container} className="oru-city-map" aria-label="Interactive neighbourhood map" />{(!styleUrl || failed) && <p role="status" className="my-3 text-muted">Map tiles are unavailable. You can still explore every territory, truck and collection point below.</p>}</>;
}
