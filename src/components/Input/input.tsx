import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@/lib/client';
import { IAddress } from '@/lib/common/interfaces/address';

const client = new Client();

interface InputProps {
  map: google.maps.Map | null;
}

const Input: React.FC<InputProps> = ({ map }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [locationMarker, setLocationMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [markersList, setMarkerList] = useState<IAddress[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [currentLocationId,setCurrentLocationId] = useState<number>(0)
  const [flag, setFlag] = useState<boolean>(false);

  const fetchMarkers = async () => {
    const addresses: any = await client.addressGetList();
    setMarkerList(addresses);
    if (map){
      const newMarkers = addresses.map((address: IAddress) => {
        const marker = new google.maps.Marker({
          position: { lat: address.latitude, lng: address.longitude },
          map: map,
          title: address.location || 'Marker Title',
          icon: {
            path: address.isCurrentLocation ? google.maps.SymbolPath.BACKWARD_CLOSED_ARROW : '',
            scale: address.isCurrentLocation ? 6 : 0,
            strokeColor: address.isCurrentLocation ? '#0000FF' : '',
            fillColor: address.isCurrentLocation ? '#0000FF' : '#00000',
            fillOpacity: address.isCurrentLocation ? 1 : 0,
          },
        });
        if (address.isCurrentLocation) {
          setCurrentLocation(address.location);
          setCurrentLocationId(address.id)
        }
        return marker;
      });
      setMarkers(newMarkers);
      
      if (addresses.length > 0) {
        const latestAddress = addresses[addresses.length - 1];
        const latestMarkerPosition = { lat: latestAddress.latitude, lng: latestAddress.longitude };
        if (latestMarkerPosition) {
          map?.setCenter(latestMarkerPosition);
        }
      }
    };
  }

  useEffect(() => {
    fetchMarkers();
    return () => {
      markers.forEach(marker => {
        marker.setMap(null);
      });
    };
  }, [map, selectedMarker]);

  const handleMarkLocation = () => {
    if (map && inputRef.current && inputRef.current.value) {
      if (autocomplete) {
        autocomplete.unbindAll();
      }
      if (google){
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: inputRef.current.value }, async (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const { lat, lng } = results[0].geometry.location;
  
            map.setCenter({ lat: lat(), lng: lng() });
  
            const marker = new google.maps.Marker({
              position: { lat: lat(), lng: lng() },
              map: map,
              title: results[0].formatted_address || 'Marker Title',
              icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                strokeColor: flag ? '#0000FF' : '',
                fillColor: flag ? '#0000FF' : '',
                fillOpacity: 1,
              },
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
            setLocationMarker(marker);
  
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
    let currentMarker: google.maps.Marker | undefined;
    const destinations: google.maps.Marker[] = [];

    for (const marker of markers) {
      if (marker.getTitle() === currentLocation) {
        currentMarker = marker;
      } else {
        destinations.push(marker);
      }
    }

    if (currentMarker && destinations.length > 0) {
      const addresses = [];
      addresses.push(currentMarker);
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
    setSelectedMarker(id);
    for (let i = 0; i < markersList.length; i++) {
      if (markersList[i].id == id) {
        map?.setCenter({ lat: markersList[i].latitude, lng: markersList[i].longitude });
      }
    }
  };
  const handleRemoveCurrentLocation = async () => {
    await client.addressUpdate(currentLocationId,false)
    setCurrentLocation("")
  }
  const handleDeleteMarker = async () => {
    if (selectedMarker) {
      const markerId = selectedMarker;
      await client.addressDelete(markerId);
      setSelectedMarker(null);
      fetchMarkers();
    }
  };

  const handleInputFocus = () => {
    if (map && !autocomplete) {
      setAutocomplete(new google.maps.places.Autocomplete(inputRef.current!));
    }
  };

  return (
    <div className='flex py-3 px-2 justify-around gap-x-10'>
      {!flag ? (
        <div className='flex gap-x-5'>
          <input className='border rounded py-2 px-4' ref={inputRef} onFocus={handleInputFocus} placeholder="Enter a location" />
          <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleMarkLocation}>Mark Location</button>
          {markersList.length > 2 && (
            <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={() => { setFlag(true) }}>Mark current location</button>
          )}
        </div>
      ) : (
        <>
          {currentLocation ? (
            <div className='flex gap-x-5'>
              <input className='border rounded py-2 px-4' ref={inputRef} value={currentLocation} onFocus={handleInputFocus} />
              <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleRemoveCurrentLocation}>Mark another location as current</button>
            </div>
          ) : (

            <div className='flex gap-x-5'>
              <input className='border rounded py-2 px-4' ref={inputRef} onFocus={handleInputFocus} placeholder="Enter a location" />
              <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleMarkLocation}>Mark Location</button>
              <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={() => { setFlag(false) }}>Mark more location</button>
            </div>
          )}
        </>
      )}
      <div className='flex gap-x-5'>
        <select
          className='border rounded py-2 px-4'
          value={selectedMarker || 0}
          onChange={(e) => {
            const selectedMarkerId = parseInt(e.target.value, 10);
            handleMarkerSelect(selectedMarkerId);
          }}
        >
          <option key="default" value="">Select a marker to delete</option>
          {markersList && markersList.map(marker => {
            return (
              <option key={marker.id} value={marker.id}>{marker.location}</option>
            );
          })}
        </select>
        <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleDeleteMarker}>Delete Marker</button>
      </div>
      <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleCalculateRoute}>Calculate Route</button>
    </div>
  );
};

export default Input;
