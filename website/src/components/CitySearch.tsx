import React from "react";
import AsyncSelect from "react-select/async";
import { ActionMeta, SingleValue } from "react-select";
import LocationService, { Location } from "../services/LocationService";

interface CityOption {
  label: string;
  value: { lat: string; lon: string };
}

type LoadOptionsType = Promise<Array<CityOption>>;

interface CitySearchComponentProps {
  onChange: (location: Location) => void;
  messageText: string;
  storeLocation?: boolean;
}

const CitySearchComponent: React.FC<CitySearchComponentProps> = ({
  onChange,
  messageText,
  storeLocation,
}) => {
  const loadOptions = async (inputValue: string): LoadOptionsType => {
    if (!inputValue) {
      return [];
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          inputValue
        )}&format=json&limit=5`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      return data.map((city: any) => ({
        label: city.display_name,
        value: { lat: city.lat, lon: city.lon },
      }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  // The handleChange function can now correctly infer the type of selectedOption
  const handleChange = (
    selectedOption: SingleValue<CityOption>,
    _: ActionMeta<CityOption>
  ) => {
    if (selectedOption) {
      let lat = parseFloat(selectedOption.value.lat);
      let lon = parseFloat(selectedOption.value.lon);

      if (storeLocation) {
        LocationService.overrideLocation(lat, lon);
      }

      onChange({
        latitude: parseFloat(selectedOption.value.lat),
        longitude: parseFloat(selectedOption.value.lon),
        override: true,
      } as Location);
    }
  };

  return (
    <div className="p-4">
      {messageText && (
        <label className="label">
          <span className="label-text">{messageText}</span>
        </label>
      )}
      <AsyncSelect
        defaultOptions
        loadOptions={loadOptions}
        onChange={handleChange}
      />
    </div>
  );
};

export default CitySearchComponent;
