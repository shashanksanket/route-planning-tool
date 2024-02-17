"use client"
import React, { useEffect, useState } from 'react';
interface MapComponentProps {
  markers: google.maps.Marker[];
}

const MapComponent: React.FC<MapComponentProps> = ({ markers }) => {
  const [googleMap, setGoogleMap] = useState<google.maps.Map>();

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
