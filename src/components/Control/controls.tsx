import { IAddress } from '@/lib/common/interfaces/address';
import React, { RefObject, useRef } from 'react';
interface ControlsComponentProps {
  inputRef: RefObject<HTMLInputElement>;
  handleInputFocus: () => void;
  handleMarkLocation: () => void;
  selectedMarkerId: number | null;
  markersList: IAddress[];
  handleMarkerSelect: (selectedMarkerId: number) => void;
  handleDeleteMarker: () => void;
  handleCalculateRoute: () => void;
}

const ControlsComponent: React.FC<ControlsComponentProps> = ({ 
  inputRef,
  handleInputFocus,
  handleMarkLocation,
  selectedMarkerId,
  markersList,
  handleMarkerSelect,
  handleDeleteMarker,
  handleCalculateRoute 
}) => {
  return (
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
  );
};

export default ControlsComponent;