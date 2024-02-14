"use client"
/* eslint-disable  @next/next/no-sync-scripts */
import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const Map: React.FC<{ setMap: React.Dispatch<React.SetStateAction<google.maps.Map | null>>, markers: google.maps.Marker[] }> = ({ setMap, markers }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const loadMapScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    };

    if (!mapLoaded) {
      loadMapScript();
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (mapLoaded && !googleMap) {
      const map = new google.maps.Map(document.getElementById('map')!, {
        center: { lat: 0, lng: 0 },
        zoom: 8,
      });
      setGoogleMap(map);
      setMap(map);
    }
  }, [mapLoaded, googleMap, setMap]);

  useEffect(() => {
    if (googleMap && markers.length > 0) {
      markers.forEach(marker => {
        marker.setMap(googleMap);
      });
    }
  }, [googleMap, markers]);

  useEffect(() => {
    return () => {
      if (googleMap) {
        markers.forEach(marker => {
          marker.setMap(null);
        });
      }
    };
  }, [googleMap, markers]);

  return (
    <>
      <Head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        ></script>
      </Head>
      <div id="map" style={{ width: '100%', height: '400px' }}></div>
    </>
  );
};

export default Map;
