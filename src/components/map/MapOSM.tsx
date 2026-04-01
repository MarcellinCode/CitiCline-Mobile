import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

interface MapOSMProps {
  userLocation: { latitude: number; longitude: number } | null;
  hubs: any[];
  wastes: any[];
  onMarkerPress: (id: string, type: 'HUB' | 'WASTE') => void;
}

export const MapOSM = ({ userLocation, hubs, wastes, onMarkerPress }: MapOSMProps) => {
  const center = userLocation || { latitude: 5.3484, longitude: -4.0305 };

  const mapHtml = `
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
          background: white; border-radius: 12px; border: 2px solid #14b8a6;
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
        const map = L.map('map', { zoomControl: false }).setView([${center.latitude}, ${center.longitude}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // User Location
        if (${userLocation !== null}) {
          L.circle([${center.latitude}, ${center.longitude}], {
            color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, radius: 200
          }).addTo(map);
          L.marker([${center.latitude}, ${center.longitude}], {
            icon: L.divIcon({ className: 'user-marker', iconSize: [14, 14] })
          }).addTo(map);
        }

        // Hubs
        const hubs = ${JSON.stringify(hubs)};
        hubs.forEach(h => {
          L.marker([h.latitude, h.longitude], {
            icon: L.divIcon({ className: 'custom-marker', html: h.emoji, iconSize: [38, 38] })
          }).addTo(map).on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HUB', id: h.id }));
          });
        });

        // Wastes
        const wastes = ${JSON.stringify(wastes)};
        wastes.forEach(w => {
          if (w.latitude && w.longitude) {
            L.marker([w.latitude, w.longitude], {
              icon: L.divIcon({ 
                className: 'custom-marker', 
                html: w.waste_types?.emoji || '🗑️', 
                iconSize: [38, 38] 
              })
            }).addTo(map).on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WASTE', id: w.id }));
            });
          }
        });

        // Auto-recenter when user clicked (optional)
        setTimeout(() => map.invalidateSize(), 500);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ 
          html: mapHtml,
          headers: { 'Referer': 'https://citicline.com' }
        }}
        userAgent="CiticlineMobileApp/1.0 (https://citicline.com)"
        style={styles.map}
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
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
