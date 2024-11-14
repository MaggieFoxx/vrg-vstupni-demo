import React, { useState } from 'react';
import axios from 'axios';
import { fromLonLat } from 'ol/proj';
import { Map } from 'ol';

interface SearchLocationProps {
  mapRef: React.MutableRefObject<Map | null>;
}

const SearchLocation: React.FC<SearchLocationProps> = ({ mapRef }) => {
  const [location, setLocation] = useState<string>('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?city=${location}&format=json`
      );
      const data = response.data;
      if (data.length > 0) {
        const { lon, lat } = data[0];
        mapRef.current
          ?.getView()
          .setCenter(fromLonLat([parseFloat(lon), parseFloat(lat)]));
        mapRef.current?.getView().setZoom(12);
      } else {
        alert('City not found');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      alert('An error occurred while searching for the city');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location"
        className="border p-2 mb-4 w-full text-black"
      />
      <button className="btn w-full mb-2" onClick={handleSearch}>
        Search location
      </button>
    </div>
  );
};

export default SearchLocation;