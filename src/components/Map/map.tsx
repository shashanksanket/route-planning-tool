"use client"
import React, { useEffect, useState } from 'react';
interface MapComponentProps {
  markers: google.maps.Marker[];
}

const MapComponent: React.FC<MapComponentProps> = ({ markers }) => {
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);


  useEffect(() => {
    const loadMapScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const mapInstance = new google.maps.Map(document.getElementById('map')!, {
          center: { lat: 0, lng: 0 },
          zoom: 8,
        });
        setGoogleMap(mapInstance);
      };
      document.head.appendChild(script);
    };

    loadMapScript();
  }, []);

  useEffect(() => {
    if (googleMap && markers.length > 0) {
      markers.forEach(marker => {
        marker.setMap(googleMap);
      });
    }
  }, [googleMap, markers]);

  return (
    <div id="map" style={{ width: '100%', height: '400px' }}></div>
  );
};

export default MapComponent;
