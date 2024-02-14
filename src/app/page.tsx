"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@/lib/client';
import Head from 'next/head';
import { IAddress } from '@/lib/common/interfaces/address';

const client = new Client();

export default function Home() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [markersList, setMarkerList] = useState<IAddress[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [currentLocationId, setCurrentLocationId] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [selectedMarkTitle, setSelectedMarkerTitle] = useState<string>("")

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
            console.log("Saved marker in db:", res);

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
    console.log(request)

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    directionsService.route(request, function (response, status) {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        alert("Directions request failed due to " + status);
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
      console.log(shortestPath);
      const addressString: string[] = []
      for (let i = 0; i < shortestPath.length; i++) {
        addressString.push(shortestPath[i].getTitle() || "")
      }
      drawPathRoute(addressString);
    } else {
      console.error("Current location or destinations not found.");
    }
  };

  const handleMarkerSelect = (id: number) => {
    setSelectedMarkerId(id);
    const selectedMarker = markersList.find(marker => marker.id === id);
    setSelectedMarkerTitle(selectedMarker?.location || "")
    if (selectedMarker && map) {
      map.setCenter({ lat: selectedMarker.latitude, lng: selectedMarker.longitude });
    }
  };
  useEffect(() => {
    // Remove all markers from the map when the markers state changes
    markers.forEach(marker => marker.setMap(null));

    // Set the map again with the updated markers
    if (googleMap && markers.length > 0) {
      markers.forEach(marker => marker.setMap(googleMap));
    }
  }, [markers, googleMap]);

  const handleDeleteMarker = async () => {
    if (selectedMarkerId) {
      const markerId = selectedMarkerId;
      await client.addressDelete(markerId);
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

      // Fetch markers again after deletion
      await fetchMarkers();
    }
  };


  useEffect(() => {
    // Remove all markers from the map when the markers state changes
    markers.forEach(marker => marker.setMap(null));

    // Set the map again with the updated markers
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
      <main className="flex flex-col gap-y-10 m-4">
        <div id="map" style={{ width: '100%', height: '400px' }}></div>
        <div className='flex py-3 px-2 flex-col md:flex-row justify-around gap-x-10'>
          <div className='flex gap-x-5'>
            <input className='border rounded py-2 px-4' ref={inputRef} onFocus={handleInputFocus} placeholder="Enter a location" />
            <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleMarkLocation}>Mark Location</button>
          </div>

          <div className='flex gap-x-5'>
            <select
              className='border rounded py-2 px-4'
              value={selectedMarkerId || ""}
              onChange={(e) => {
                const selectedMarkerId = parseInt(e.target.value, 10);
                handleMarkerSelect(selectedMarkerId);
              }}
            >
              <option key="default" value="">Select a marker to delete</option>
              {markersList.map(marker => (
                <option key={marker.id} value={marker.id}>{marker.location}</option>
              ))}
            </select>
            <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleDeleteMarker}>Delete Marker</button>
          </div>
          <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleCalculateRoute}>Calculate Route</button>
        </div>
        {markersList.length > 2 && (
          <p className='ml-10'>Technician Location: {markersList[markersList.length - 1].location}</p>
        )}
      </main>
    </>
  );
}
