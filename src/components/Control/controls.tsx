import { IAddress } from '@/lib/common/interfaces/address';
import React, { RefObject, useRef } from 'react';
interface ControlsComponentProps {
  inputRef: RefObject<HTMLInputElement>;
  handleInputFocus: () => void;
  handleMarkLocation: () => void;
  selectedMarkerId: string | null;
  markersList: IAddress[];
  handleMarkerSelect: (selectedMarkerId: string) => void;
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
    <div className='flex py-3 flex-wrap px-2 flex-col md:flex-row justify-around gap-10'>
      <div className='flex flex-wrap flex-col md:flex-row gap-5'>
        <input className='border rounded py-2 px-4' ref={inputRef} onFocus={handleInputFocus} placeholder="Enter a location" />
        <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleMarkLocation}>Mark Location</button>
      </div>
      <div className='flex flex-wrap flex-col md:flex-row gap-5'>
        <select
          className='border rounded py-2 px-4'
          value={selectedMarkerId || ""}
          onChange={(e) => {
            const selectedMarkerId = e?.target?.value;
            handleMarkerSelect(selectedMarkerId);
          }}
        >
          <option key="default" value="">Select location that you visited</option>
          {markersList.map(marker => (
            <option key={marker._id} value={marker._id}>{marker.location}</option>
          ))}
        </select>
        <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleDeleteMarker}>Mark Visited</button>
      </div>
      <button className='rounded-full bg-blue-900 text-white hover:text-black hover:bg-white hover:border-blue-900 border py-2 px-4' onClick={handleCalculateRoute}>Calculate Route</button>
    </div>
  );
};

export default ControlsComponent;