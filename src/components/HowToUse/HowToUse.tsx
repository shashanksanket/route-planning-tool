import Image from 'next/image';
import React from 'react';
interface HowToUseComponentProps {
  show: boolean;
  onClose: () => void;
}

const HowToUseComponent: React.FC<HowToUseComponentProps> = ({ show, onClose }) => {
  return (
    <>
      {show && (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-filter backdrop-blur-md'>
          <div className='bg-white rounded-lg p-8'>
            <h2 className='text-xl font-bold mb-4'>How to Use</h2>
            <Image src="/preview.png" alt='preview' width={800} height={500}/>
            <p className='text-red-700 ml-4'>Some times the API calling or map loading may be slow, just try to refresh and try again</p>
            <button className='bg-blue-500 text-white px-4 py-2 rounded mt-4' onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default HowToUseComponent;
