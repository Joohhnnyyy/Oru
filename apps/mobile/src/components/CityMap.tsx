import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type { LiveTruck, MapBin, MapTerritory } from '../services/api';
import { MAP_SPRITES } from '../theme/mapSprites';

// react-native-webview's class typings clash with React 19 JSX types (same workaround as Google3DMap)
const RNWebView = WebView as any;

export type MapSelection =
  | { kind: 'territory'; id: string }
  | { kind: 'bin'; id: string }
  | { kind: 'truck'; id: string }
  | null;
export type MapFilter = 'all' | 'trucks' | 'bins';
type LatLng = { latitude: number; longitude: number };

/**
 * City map rendered with MapLibre GL inside a WebView.
 * Base map: Amazon Location Service (Maps API v2 style URL from GET /v1/map); falls back to
 * OpenStreetMap tiles if no key is configured. Layers: H3 territory hexes coloured by health,
 * guardian markers, bins coloured by fill status, live trucks and a selected truck's trail.
 */
export const CityMap: React.FC<{
  styleUrl: string | null;
  territories: MapTerritory[];
  bins: MapBin[];
  trucks: LiveTruck[];
  trail: LatLng[];
  selection: MapSelection;
  filter: MapFilter;
  user: LatLng | null;
  onSelect: (sel: MapSelection) => void;
}> = ({ styleUrl, territories, bins, trucks, trail, selection, filter, user, onSelect }) => {
  const web = useRef<WebView>(null);
  const ready = useRef(false);

  const html = useMemo(() => buildHtml(styleUrl), [styleUrl]);

  const call = useCallback((fn: string, arg: unknown) => {
    if (!ready.current) return;
    web.current?.injectJavaScript(`window.oru && window.oru.${fn}(${JSON.stringify(arg)}); true;`);
  }, []);

  const pushAll = useCallback(() => {
    call('setData', {
      territories: territories.map((t) => ({
        id: t.territoryId, name: t.name, health: t.health, guardian: t.guardian.id, center: t.center, boundary: t.boundary,
      })),
      bins: bins.map((b) => ({ id: b.sourceId, kind: b.kind, status: b.status, lat: b.latitude, lng: b.longitude })),
    });
    call('setTrucks', trucks.map((t) => ({ id: t.sourceId, lat: t.latitude, lng: t.longitude, active: t.status === 'active' })));
    call('setTrail', trail.map((p) => [p.longitude, p.latitude]));
    call('setFilter', filter);
    call('setUser', user);
    call('select', selection);
  }, [call, territories, bins, trucks, trail, filter, user, selection]);

  useEffect(() => { call('setData', {
    territories: territories.map((t) => ({ id: t.territoryId, name: t.name, health: t.health, guardian: t.guardian.id, center: t.center, boundary: t.boundary })),
    bins: bins.map((b) => ({ id: b.sourceId, kind: b.kind, status: b.status, lat: b.latitude, lng: b.longitude })),
  }); }, [territories, bins]);
  useEffect(() => { call('setTrucks', trucks.map((t) => ({ id: t.sourceId, lat: t.latitude, lng: t.longitude, active: t.status === 'active' }))); }, [trucks]);
  useEffect(() => { call('setTrail', trail.map((p) => [p.longitude, p.latitude])); }, [trail]);
  useEffect(() => { call('setFilter', filter); }, [filter]);
  useEffect(() => { call('setUser', user); }, [user]);
  useEffect(() => { call('select', selection); }, [selection]);

  const onMessage = (e: WebViewMessageEvent) => {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg.type === 'ready') { ready.current = true; pushAll(); return; }
    if (msg.type === 'territory' || msg.type === 'bin' || msg.type === 'truck') onSelect({ kind: msg.type, id: String(msg.id) });
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <RNWebView
        key={styleUrl ?? 'osm'}
        ref={web}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://oru.app/' }}
        onMessage={onMessage}
        onLoadStart={() => { ready.current = false; }}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        overScrollMode="never"
        style={styles.web}
      />
    </View>
  );
};

const styles = StyleSheet.create({ web: { flex: 1, backgroundColor: '#EEF2F6' } });

function buildHtml(styleUrl: string | null): string {
  const fallbackStyle = {
    version: 8,
    sources: {
      osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  };
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css">
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#EEF2F6;overflow:hidden}
  .g{width:34px;height:34px;border-radius:50%;background:#fff;border:3px solid #43E34F;box-shadow:0 3px 10px rgba(11,42,51,.25);display:flex;align-items:center;justify-content:center;transition:transform .25s cubic-bezier(.3,1.4,.5,1)}
  .g img{width:30px;height:30px;object-fit:contain}
  .g.sel{transform:scale(1.55);z-index:5}
  .hideG .g:not(.sel){display:none}
  .t{width:42px;height:42px;position:relative}
  .t img{width:42px;height:42px;object-fit:contain;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))}
  .t.idle img{filter:grayscale(1) opacity(.65)}
  .t.active::before{content:'';position:absolute;inset:-6px;border-radius:50%;background:rgba(67,227,79,.35);animation:p 1.8s ease-out infinite}
  .t.sel img{transform:scale(1.25)}
  .hideT .t{display:none}
  @keyframes p{0%{transform:scale(.6);opacity:1}100%{transform:scale(1.6);opacity:0}}
  .me{width:16px;height:16px;border-radius:50%;background:#0a6e9e;border:3px solid #fff;box-shadow:0 0 0 6px rgba(10,110,158,.2)}
  .maplibregl-ctrl-attrib{font-size:9px}
</style></head><body><div id="map"></div>
<script>
var SPRITES=${JSON.stringify(MAP_SPRITES)};
var STYLE=${JSON.stringify(styleUrl || fallbackStyle)};
var map, ready=false, D={territories:[],bins:[]}, T=[], TRAIL=[], SEL=null, FILTER='all', USER=null;
var gM={}, tM={}, meM=null, firstFit=true;
function post(m){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
function hc(h){ return h>=70?'#43E34F':h>=40?'#FFB800':'#FF5A5F'; }
var BIN_C={OK:'#43E34F',FILLING:'#FFB800',NEEDS_PICKUP:'#FF4D5E',DAMAGED:'#8B5CF6'};
function fc(f){ return {type:'FeatureCollection',features:f}; }
function ring(b){ var r=b.map(function(p){return [p[1],p[0]];}); r.push(r[0]); return r; }

function renderTerritories(){
  if(!ready) return;
  map.getSource('territories').setData(fc(D.territories.map(function(t){
    return {type:'Feature',properties:{id:t.id,color:hc(t.health),selected:!!(SEL&&SEL.kind==='territory'&&SEL.id===t.id)},geometry:{type:'Polygon',coordinates:[ring(t.boundary)]}};
  })));
  var seen={};
  D.territories.forEach(function(t){
    seen[t.id]=1;
    var m=gM[t.id];
    if(!m){
      var el=document.createElement('div'); el.className='g';
      el.innerHTML='<img src="'+(SPRITES[t.guardian]||SPRITES.buddy)+'">';
      el.addEventListener('click',function(e){ e.stopPropagation(); post({type:'territory',id:t.id}); });
      m=new maplibregl.Marker({element:el}).setLngLat([t.center.longitude,t.center.latitude]).addTo(map); gM[t.id]=m;
    }
    var el2=m.getElement(); el2.style.borderColor=hc(t.health);
    el2.querySelector('img').src=(Math.round(t.health)<=30 && SPRITES['sad_'+t.guardian]) || SPRITES[t.guardian] || SPRITES.buddy;
    el2.classList.toggle('sel', !!(SEL&&SEL.kind==='territory'&&SEL.id===t.id));
  });
  Object.keys(gM).forEach(function(id){ if(!seen[id]){ gM[id].remove(); delete gM[id]; } });
  if(firstFit && D.territories.length){
    firstFit=false; var b=new maplibregl.LngLatBounds();
    D.territories.forEach(function(t){ b.extend([t.center.longitude,t.center.latitude]); });
    map.fitBounds(b,{padding:{top:150,bottom:320,left:30,right:30},duration:0,maxZoom:12});
  }
}
function renderBins(){
  if(!ready) return;
  map.getSource('bins').setData(fc(D.bins.map(function(b){
    return {type:'Feature',properties:{id:b.id,color:b.kind==='ewaste'?'#3B82F6':(BIN_C[b.status]||'#43E34F'),selected:!!(SEL&&SEL.kind==='bin'&&SEL.id===b.id)},geometry:{type:'Point',coordinates:[b.lng,b.lat]}};
  })));
}
function renderTrucks(){
  if(!ready) return;
  var seen={};
  T.forEach(function(t){
    seen[t.id]=1; var m=tM[t.id];
    if(!m){
      var el=document.createElement('div'); el.className='t';
      el.innerHTML='<img src="'+SPRITES.truck+'">';
      el.addEventListener('click',function(e){ e.stopPropagation(); post({type:'truck',id:t.id}); });
      m=new maplibregl.Marker({element:el}).setLngLat([t.lng,t.lat]).addTo(map); tM[t.id]=m;
    } else { m.setLngLat([t.lng,t.lat]); }
    var el2=m.getElement(); el2.className='t '+(t.active?'active':'idle')+((SEL&&SEL.kind==='truck'&&SEL.id===t.id)?' sel':'');
  });
  Object.keys(tM).forEach(function(id){ if(!seen[id]){ tM[id].remove(); delete tM[id]; } });
}
function renderTrail(){ if(ready) map.getSource('trail').setData(fc(TRAIL.length>1?[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:TRAIL}}]:[])); }
function renderFilter(){
  if(!ready) return;
  var showBins=FILTER!=='trucks', showTrucks=FILTER!=='bins';
  ['bins-dot'].forEach(function(l){ map.setLayoutProperty(l,'visibility',showBins?'visible':'none'); });
  document.body.classList.toggle('hideT',!showTrucks);
}
function renderZoom(){ document.body.classList.toggle('hideG', map.getZoom()<11.2); }
function renderUser(){
  if(!ready) return;
  if(!USER){ if(meM){meM.remove();meM=null;} return; }
  if(!meM){ var el=document.createElement('div'); el.className='me'; meM=new maplibregl.Marker({element:el}).setLngLat([USER.longitude,USER.latitude]).addTo(map); }
  else meM.setLngLat([USER.longitude,USER.latitude]);
}
function focusSelection(){
  if(!ready||!SEL) return;
  var c=null, z=13.5;
  if(SEL.kind==='territory'){ var t=D.territories.find(function(x){return x.id===SEL.id;}); if(t) c=[t.center.longitude,t.center.latitude]; z=13; }
  if(SEL.kind==='bin'){ var b=D.bins.find(function(x){return x.id===SEL.id;}); if(b) c=[b.lng,b.lat]; z=15.5; }
  if(SEL.kind==='truck'){ var k=T.find(function(x){return x.id===SEL.id;}); if(k) c=[k.lng,k.lat]; z=14.5; }
  if(c) map.easeTo({center:c,zoom:Math.max(map.getZoom(),z),padding:{top:150,bottom:330,left:0,right:0},duration:700});
}

window.oru={
  setData:function(d){ D=d; renderTerritories(); renderBins(); },
  setTrucks:function(t){ T=t; renderTrucks(); },
  setTrail:function(p){ TRAIL=p; renderTrail(); },
  setFilter:function(f){ FILTER=f; renderFilter(); },
  setUser:function(u){ USER=u; renderUser(); },
  select:function(s){ var changed=JSON.stringify(s)!==JSON.stringify(SEL); SEL=s; renderTerritories(); renderBins(); renderTrucks(); if(changed) focusSelection(); }
};

try {
  map=new maplibregl.Map({container:'map',style:STYLE,center:[77.21,28.61],zoom:10.4,attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false});
  map.touchZoomRotate.disableRotation();
  map.on('load',function(){
    map.addSource('territories',{type:'geojson',data:fc([])});
    map.addLayer({id:'terr-fill',type:'fill',source:'territories',paint:{'fill-color':['get','color'],'fill-opacity':['case',['boolean',['get','selected'],false],0.38,0.16]}});
    map.addLayer({id:'terr-line',type:'line',source:'territories',paint:{'line-color':['get','color'],'line-opacity':0.9,'line-width':['case',['boolean',['get','selected'],false],3.5,1.2]}});
    map.addSource('trail',{type:'geojson',data:fc([])});
    map.addLayer({id:'trail-line',type:'line',source:'trail',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#0a6e9e','line-width':4,'line-opacity':0.85}});
    map.addSource('bins',{type:'geojson',data:fc([])});
    map.addLayer({id:'bins-dot',type:'circle',source:'bins',paint:{
      'circle-radius':['interpolate',['linear'],['zoom'],10,['case',['boolean',['get','selected'],false],7,3.5],15,['case',['boolean',['get','selected'],false],14,9]],
      'circle-color':['get','color'],'circle-stroke-width':2,'circle-stroke-color':'#ffffff'}});
    map.on('click',function(e){
      var pad=12, box=[[e.point.x-pad,e.point.y-pad],[e.point.x+pad,e.point.y+pad]];
      var bin=FILTER!=='trucks'?map.queryRenderedFeatures(box,{layers:['bins-dot']})[0]:null;
      if(bin){ post({type:'bin',id:bin.properties.id}); return; }
      var t=map.queryRenderedFeatures(e.point,{layers:['terr-fill']})[0];
      if(t) post({type:'territory',id:t.properties.id});
    });
    map.on('zoom',renderZoom);
    ready=true; renderZoom(); post({type:'ready'});
  });
  map.on('error',function(e){ post({type:'error',message:(e&&e.error&&e.error.message)||'map error'}); });
} catch(err){ post({type:'error',message:String(err)}); }
</script></body></html>`;
}
