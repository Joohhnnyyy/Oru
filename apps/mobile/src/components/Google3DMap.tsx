import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/tokens';

const RNWebView = WebView as any;

interface Google3DMapProps {
  apiKey: string;
  selectedTerritoryId?: string;
  onSelectTerritory?: (territoryId: string) => void;
  activeFilter?: 'all' | 'trucks' | 'drop_points';
}

const TERRITORY_COORDS: Record<string, { lat: number; lng: number; altitude: number; tilt: number; heading: number }> = {
  '1': { lat: 28.5700, lng: 77.2400, altitude: 450, tilt: 65, heading: 45 },   // S34 Lajpat Nagar
  '2': { lat: 28.6315, lng: 77.2167, altitude: 500, tilt: 68, heading: 0 },    // C12 Connaught Place
  '3': { lat: 28.6080, lng: 77.2950, altitude: 550, tilt: 62, heading: 80 },   // E45 Mayur Vihar
  '4': { lat: 28.6470, lng: 77.1230, altitude: 480, tilt: 65, heading: 270 },  // W23 Rajouri Garden
  '5': { lat: 28.6800, lng: 77.2200, altitude: 520, tilt: 64, heading: 180 },  // N08 Civil Lines
};

export const Google3DMap: React.FC<Google3DMapProps> = ({
  apiKey,
  selectedTerritoryId = '1',
  onSelectTerritory,
  activeFilter = 'all',
}) => {
  const webViewRef = useRef<WebView>(null);

  // Sync camera when selected territory changes
  useEffect(() => {
    const coords = TERRITORY_COORDS[selectedTerritoryId] || TERRITORY_COORDS['1'];
    const jsCode = `
      if (window.flyToLocation) {
        window.flyToLocation(${coords.lat}, ${coords.lng}, ${coords.altitude}, ${coords.tilt}, ${coords.heading});
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(jsCode);
  }, [selectedTerritoryId]);

  // Sync layer filters
  useEffect(() => {
    const jsCode = `
      if (window.applyFilter) {
        window.applyFilter("${activeFilter}");
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(jsCode);
  }, [activeFilter]);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Delhi NCR 3D Map</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #map3d, #mapFallback { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
    .hud-badge {
      display: none !important; /* the screen draws its own header over the map */
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 99;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: 1px solid #E2E8F0;
      color: #0F172A;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .hud-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #00E5B3;
      box-shadow: 0 0 6px #00E5B3;
    }
    .custom-marker {
      background: #00E5B3;
      color: #0A0F1D;
      padding: 6px 10px;
      border-radius: 16px;
      font-weight: 800;
      font-size: 11px;
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      cursor: pointer;
    }
  </style>
  <script async src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=alpha&libraries=maps3d,marker"></script>
</head>
<body>
  <div class="hud-badge">
    <div class="hud-dot"></div>
    <span>GOOGLE 3D PHOTOREALISTIC MAP</span>
  </div>

  <gmp-map-3d id="map3d" center="28.5700,77.2400,450" tilt="65" heading="45" range="1200"></gmp-map-3d>
  <div id="mapFallback" style="display: none;"></div>

  <script>
    let map3dElement = document.getElementById('map3d');
    let fallbackMap = null;

    // Check if gmp-map-3d initialized or fallback to WebGL 3D Satellite Map
    setTimeout(function() {
      if (!map3dElement || typeof customElements === 'undefined' || !customElements.get('gmp-map-3d')) {
        initFallback2D();
      }
    }, 2500);

    function initFallback2D() {
      var map3d = document.getElementById('map3d');
      if (map3d) map3d.style.display = 'none';
      var fallbackDiv = document.getElementById('mapFallback');
      fallbackDiv.style.display = 'block';

      if (window.google && window.google.maps) {
        fallbackMap = new google.maps.Map(fallbackDiv, {
          center: { lat: 28.5700, lng: 77.2400 },
          zoom: 17,
          heading: 45,
          tilt: 65,
          mapTypeId: 'hybrid',
          disableDefaultUI: true,
        });

        // Add 3D markers for territories
        var territories = [
          { id: '1', name: 'S34 Lajpat Nagar (Health: 72%)', lat: 28.5700, lng: 77.2400 },
          { id: '2', name: 'C12 Connaught Place (Health: 88%)', lat: 28.6315, lng: 77.2167 },
          { id: '3', name: 'E45 Mayur Vihar (Health: 64%)', lat: 28.6080, lng: 77.2950 },
          { id: '4', name: 'W23 Rajouri Garden (Health: 48%)', lat: 28.6470, lng: 77.1230 },
          { id: '5', name: 'N08 Civil Lines (Health: 92%)', lat: 28.6800, lng: 77.2200 }
        ];

        territories.forEach(function(t) {
          var marker = new google.maps.Marker({
            position: { lat: t.lat, lng: t.lng },
            map: fallbackMap,
            title: t.name,
            label: {
              text: t.name.split(' ')[0],
              color: '#0A0F1D',
              fontWeight: 'bold',
              fontSize: '11px'
            }
          });
          marker.addListener('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TERRITORY_CLICK', id: t.id }));
            }
          });
        });

        // Add live truck markers
        var trucks = [
          { lat: 28.5710, lng: 77.2415, title: 'MCD Truck DL-1M-4821' },
          { lat: 28.6330, lng: 77.2190, title: 'MCD Truck DL-1M-7742' }
        ];
        trucks.forEach(function(tr) {
          truckMarkers.push(new google.maps.Marker({
            position: { lat: tr.lat, lng: tr.lng },
            map: fallbackMap,
            title: tr.title,
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: '#00E5B3',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              rotation: 45
            }
          }));
        });

        // Add drop-point (bin) markers
        var bins = [
          { lat: 28.5718, lng: 77.2432, title: 'Central Market Bin #402' },
          { lat: 28.6098, lng: 77.2965, title: 'Mayur Vihar Smart Bin #118' },
          { lat: 28.6465, lng: 77.1248, title: 'Rajouri Garden Bin #271' }
        ];
        bins.forEach(function(b) {
          binMarkers.push(new google.maps.Marker({
            position: { lat: b.lat, lng: b.lng },
            map: fallbackMap,
            title: b.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#FFD64A',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#0A0F1D'
            }
          }));
        });

        applyFilterToMarkers(window.__activeFilter || 'all');
      }
    }

    var truckMarkers = [];
    var binMarkers = [];

    function applyFilterToMarkers(filter) {
      var showTrucks = filter === 'all' || filter === 'trucks';
      var showBins = filter === 'all' || filter === 'drop_points';
      truckMarkers.forEach(function(m) { m.setMap(showTrucks ? fallbackMap : null); });
      binMarkers.forEach(function(m) { m.setMap(showBins ? fallbackMap : null); });
    }

    // Global camera flight handler
    window.flyToLocation = function(lat, lng, altitude, tilt, heading) {
      if (map3dElement && map3dElement.flyCameraTo) {
        try {
          map3dElement.flyCameraTo({
            endCamera: {
              center: { lat: lat, lng: lng, altitude: altitude },
              tilt: tilt || 65,
              heading: heading || 45,
            },
            durationMillis: 1800,
          });
          return;
        } catch (e) {
          console.warn('3D flyCameraTo error, fallback:', e);
        }
      }

      if (fallbackMap) {
        fallbackMap.panTo({ lat: lat, lng: lng });
        fallbackMap.setZoom(17);
        fallbackMap.setTilt(tilt || 65);
        fallbackMap.setHeading(heading || 45);
      }
    };

    window.__activeFilter = 'all';
    window.applyFilter = function(filter) {
      window.__activeFilter = filter;
      applyFilterToMarkers(filter);
    };
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <RNWebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.surfaceRaised} />
          </View>
        )}
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'TERRITORY_CLICK' && onSelectTerritory) {
              onSelectTerritory(data.id);
            }
          } catch (e) {
            console.error('Error parsing WebView message:', e);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
