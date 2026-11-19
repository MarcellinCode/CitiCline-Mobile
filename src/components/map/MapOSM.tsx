import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

interface MapOSMProps {
  userLocation: { latitude: number; longitude: number } | null;
  hubs: any[];
  wastes: any[];
  infractions?: any[];
  city?: string;
  onMarkerPress: (id: string, type: 'HUB' | 'WASTE' | 'INFRACTION') => void;
}

const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  "Abidjan": { latitude: 5.3484, longitude: -4.0197 },
  "Bouaké": { latitude: 7.6894, longitude: -5.0303 },
  "Yamoussoukro": { latitude: 6.8276, longitude: -5.2893 },
  "San-Pédro": { latitude: 4.7485, longitude: -6.6363 },
  "Korhogo": { latitude: 9.4580, longitude: -5.6295 },
  "Daloa": { latitude: 6.8773, longitude: -6.4502 },
};

const STATIC_MAP_HTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      body { margin: 0; padding: 0; overflow: hidden; font-family: sans-serif; }
      #map { height: 100vh; width: 100vw; background: #f8fafc; }
      .custom-marker {
        display: flex; justify-content: center; align-items: center;
        background: white; border-radius: 12px; border: 2px solid #017A35;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-size: 20px;
      }
      .user-marker {
        background: #3b82f6; border: 4px solid white; border-radius: 50%;
        width: 14px; height: 14px;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
      }
    </style>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([5.3484, -4.0305], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      const userLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);
      let hasCentered = false;

      window.updateMapData = function(payload) {
        if (!payload) return;
        const { center, hasUserLocation, hubs, wastes, infractions } = payload;

        if (center && !hasCentered) {
          map.setView([center.latitude, center.longitude], 13);
          hasCentered = true;
        }

        userLayer.clearLayers();
        if (hasUserLocation && center) {
          L.circle([center.latitude, center.longitude], {
            color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, radius: 200
          }).addTo(userLayer);
          L.marker([center.latitude, center.longitude], {
            icon: L.divIcon({ className: 'user-marker', iconSize: [14, 14] })
          }).addTo(userLayer);
        }

        markersLayer.clearLayers();
        (hubs || []).forEach(h => {
          if (h.latitude && h.longitude) {
            L.marker([h.latitude, h.longitude], {
              icon: L.divIcon({ className: 'custom-marker', html: h.emoji || '📍', iconSize: [38, 38] })
            }).addTo(markersLayer).on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HUB', id: h.id }));
            });
          }
        });

        (wastes || []).forEach(w => {
          if (w.latitude && w.longitude) {
            L.marker([w.latitude, w.longitude], {
              icon: L.divIcon({
                className: 'custom-marker',
                html: (w.waste_types && w.waste_types.emoji) || '♻️',
                iconSize: [38, 38]
              })
            }).addTo(markersLayer).on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WASTE', id: w.id }));
            });
          }
        });

        (infractions || []).forEach(i => {
          if (i.latitude && i.longitude) {
            L.marker([i.latitude, i.longitude], {
              icon: L.divIcon({
                className: 'custom-marker',
                html: '!',
                iconSize: [38, 38]
              })
            }).addTo(markersLayer).on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INFRACTION', id: i.id }));
            });
          }
        });
      };

      setTimeout(() => map.invalidateSize(), 400);
    </script>
  </body>
  </html>
`;

export const MapOSM = React.memo(({ userLocation, hubs, wastes, infractions = [], city, onMarkerPress }: MapOSMProps) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const center = useMemo(
    () =>
      userLocation ||
      (city && CITY_COORDINATES[city]) || { latitude: 5.3484, longitude: -4.0305 },
    [userLocation, city]
  );

  const source = useMemo(
    () => ({
      html: STATIC_MAP_HTML,
      headers: { Referer: 'https://cleanzone.com' },
    }),
    []
  );

  const pushMapData = () => {
    if (!webViewRef.current) return;
    const payload = JSON.stringify({
      center,
      hasUserLocation: userLocation !== null,
      hubs,
      wastes,
      infractions,
    });
    webViewRef.current.injectJavaScript(`window.updateMapData && window.updateMapData(${payload}); true;`);
  };

  useEffect(() => {
    if (isLoaded) {
      pushMapData();
    }
  }, [isLoaded, center, userLocation, hubs, wastes, infractions]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={source}
        userAgent="CleanZoneMobileApp/1.0 (https://cleanzone.com)"
        style={styles.map}
        onLoadEnd={() => {
          setIsLoaded(true);
          pushMapData();
        }}
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            onMarkerPress(data.id, data.type);
          } catch (e) {
            console.error("WebView message error:", e);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
