"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@/lib/client';
import Head from 'next/head';
import { IAddress } from '@/lib/common/interfaces/address';
import MapComponent from '@/components/Map/map';
import ControlsComponent from '@/components/Control/controls';
import HowToUseComponent from '@/components/HowToUse/HowToUse';

const client = new Client();

export default function Home() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [markersList, setMarkerList] = useState<IAddress[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [currentLocationId, setCurrentLocationId] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [selectedMarkTitle, setSelectedMarkerTitle] = useState<string>("")
  const [showHowToUse, setShowHowToUse] = useState<boolean>(false);

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
  }, [mapLoaded, markersList]);


  useEffect(() => {
    if (mapLoaded && !googleMap) {
      const mapInstance = new google.maps.Map(document.getElementById('map')!, {
        center: { lat: 0, lng: 0 },
        zoom: 8,
      });
      setGoogleMap(mapInstance);
      setMap(mapInstance);
    }
  }, [mapLoaded, googleMap]);

  useEffect(() => {
    if (googleMap && markers.length > 0) {
      markers.forEach(marker => {
        marker.setMap(googleMap);
      });
    }
  }, [googleMap, markers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addresses: any = await client.addressGetList();
        const newMarkers: google.maps.Marker[] = addresses.map((address: IAddress) => {
          const marker = new google.maps.Marker({
            position: { lat: address.latitude, lng: address.longitude },
            title: address.location || 'Marker Title',
          });
          return marker;
        });
        setMarkers(newMarkers);
        setMarkerList(addresses);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchData();

  }, []);


  const fetchMarkers = async () => {
    const addresses: any = await client.addressGetList();
    setMarkerList(addresses);
    if (map) {
      const newMarkers = addresses.map((address: IAddress) => {
        const marker = new google.maps.Marker({
          position: { lat: address.latitude, lng: address.longitude },
          map: map,
          title: address.location || 'Marker Title',
        });
        if (address.isCurrentLocation) {
          setCurrentLocation(address.location);
          setCurrentLocationId(address.id);
        }
        return marker;
      });
      if (addresses.length > 0 && map) {
        if (selectedMarkTitle == "") {
          const lastAddress = addresses[addresses.length - 1];
          map.setCenter({ lat: lastAddress.latitude, lng: lastAddress.longitude });
        }
      }
      markers.forEach(marker => marker.setMap(null));

      setMarkers(newMarkers);
    }
  }

  const handleMarkLocation = () => {
    if (map && inputRef.current && inputRef.current.value) {
      if (autocomplete) {
        autocomplete.unbindAll();
      }
      if (googleMap) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: inputRef.current.value }, async (results, status) => {
          if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
            const { lat, lng } = results[0].geometry.location;

            map.setCenter({ lat: lat(), lng: lng() });

            const marker = new google.maps.Marker({
              position: { lat: lat(), lng: lng() },
              map: map,
              title: results[0].formatted_address || 'Marker Title',
            });
            const location = marker.getTitle() || "";
            const latitude = marker.getPosition()?.lat() || 0;
            const longitude = marker.getPosition()?.lng() || 0;
            const isCurrentLocation = flag ? true : false;
            if (flag) {
              setFlag(false);
            }
            const res = await client.createAddress(location, longitude, latitude, isCurrentLocation);
            await fetchMarkers();
            alert("Saved marker in db:");

            inputRef.current!.value = '';

            if (autocomplete) {
              autocomplete.bindTo('bounds', map);
            }
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }
    }
  };

  async function findShortestRoute(addresses: google.maps.Marker[]) {
    if (addresses.length < 2) {
      return addresses;
    }

    const shortestRoute: google.maps.Marker[] = [addresses.shift()!];

    while (addresses.length > 0) {
      let shortestDistance = Infinity;
      let nearestAddress: google.maps.Marker | undefined = undefined;

      for (const address of addresses) {
        try {
          const distance = await calculateDistance(shortestRoute[shortestRoute.length - 1]!, address);
          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestAddress = address;
          }
        } catch (error) {
          console.error('Error calculating distance:', error);
          throw error;
        }
      }

      if (nearestAddress) {
        shortestRoute.push(nearestAddress);
        addresses.splice(addresses.indexOf(nearestAddress), 1);
      }
    }

    return shortestRoute;
  }

  async function calculateDistance(location1: google.maps.Marker, location2: google.maps.Marker) {
    try {
      const lat1 = location1.getPosition()?.lat() || 0;
      const lon1 = location1.getPosition()?.lng() || 0;
      const lat2 = location2.getPosition()?.lat() || 0;
      const lon2 = location2.getPosition()?.lng() || 0;

      const R = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }

  function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  const drawPathRoute = (addresses: string[]) => {
    const waypoints = addresses.map(address => {
      const location = address;
      return { location: location, stopover: true };
    });

    const request: google.maps.DirectionsRequest = {
      origin: waypoints.shift()!.location!,
      destination: waypoints.pop()!.location!,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    };

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    directionsService.route(request, function (response, status) {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        alert("No roots can be found for a pair of locations");
      }
    });
  };
  const handleCalculateRoute = async () => {
    let technitianMarker: google.maps.Marker | undefined;
    const destinations: google.maps.Marker[] = [];

    for (let i = 0; i < markers.length; i++) {
      if (i === markers.length - 1) {
        technitianMarker = markers[i];
      } else {
        destinations.push(markers[i]);
      }
    }

    if (technitianMarker && destinations.length > 0) {
      const addresses = [];
      addresses.push(technitianMarker);
      addresses.push(...destinations);
      const shortestPath = await findShortestRoute(addresses);
      const addressString: string[] = []
      for (let i = 0; i < shortestPath.length; i++) {
        addressString.push(shortestPath[i].getTitle() || "")
      }
      drawPathRoute(addressString);
    } else {
      alert("Location or destinations not found. Atleast give 2 location to generate route");
    }
  };

  const handleMarkerSelect = (id: string) => {
    setSelectedMarkerId(id);
    const selectedMarker = markersList.find(marker => marker._id === id);
    setSelectedMarkerTitle(selectedMarker?.location || "")
    if (selectedMarker && map) {
      map.setCenter({ lat: selectedMarker.latitude, lng: selectedMarker.longitude });
    }
  };
  useEffect(() => {
    markers.forEach(marker => marker.setMap(null));

    if (googleMap && markers.length > 0) {
      markers.forEach(marker => marker.setMap(googleMap));
    }
  }, [markers, googleMap]);

  const handleDeleteMarker = async () => {
    console.log(selectedMarkerId)
    if (selectedMarkerId) {
      const markerId = selectedMarkerId;
      const res = await client.addressDelete(markerId);
      console.log(res)
      setSelectedMarkerId(null);
      const updatedMarkers = markers.filter(marker => marker.getTitle() !== selectedMarkTitle);
      markers.forEach(marker => marker.setMap(null));

      setMap(null);
      const newMapInstance = new google.maps.Map(document.getElementById('map')!, {
        center: { lat: 0, lng: 0 },
        zoom: 8,
      });
      setGoogleMap(newMapInstance);
      setMap(newMapInstance);

      await fetchMarkers();
    }
  };


  useEffect(() => {
    markers.forEach(marker => marker.setMap(null));

    if (googleMap && markers.length > 0) {
      markers.forEach(marker => marker.setMap(googleMap));
    }
  }, [markers, googleMap]);


  const handleInputFocus = () => {
    if (map && !autocomplete) {
      setAutocomplete(new google.maps.places.Autocomplete(inputRef.current!));
    }
  };

  return (
    <>
      <main className="flex flex-wrap flex-col gap-y-10 m-4">
        <MapComponent markers={markers} />
        <ControlsComponent
          inputRef={inputRef}
          handleInputFocus={handleInputFocus}
          handleMarkLocation={handleMarkLocation}
          selectedMarkerId={selectedMarkerId}
          markersList={markersList}
          handleMarkerSelect={handleMarkerSelect}
          handleDeleteMarker={handleDeleteMarker}
          handleCalculateRoute={handleCalculateRoute}
        />
        {markersList.length > 0 && (
          <p className='ml-10'>Total location Marked: {markersList.length}</p>
        )}
        {markersList.length > 1 && (
          <p className='ml-10'>Technician Location: {markersList[markersList.length - 1].location}</p>
        )}
        <p className='ml-10 cursor-pointer text-blue-800 inline-block w-fit' onClick={() => setShowHowToUse(true)}>Need Help?</p>
        <div className='absolute'>
          <HowToUseComponent show={showHowToUse} onClose={() => setShowHowToUse(false)} />
        </div>
      </main>
    </>
  );
}
