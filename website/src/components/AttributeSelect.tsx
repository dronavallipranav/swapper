import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchItemAttributes } from '../services/ItemService';

interface Attributes {
  [key: string]: string[];
}

// Custom styles for React Select to match DaisyUI
const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    borderRadius: '0.5rem',
    borderColor: '#d1d5db', // Tailwind gray-300
    padding: '0.25rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#9ca3af', // Tailwind gray-400
    }
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#60a5fa' : 'white', // Tailwind blue-400 for selected
    '&:hover': {
      backgroundColor: '#bfdbfe', // Tailwind blue-200
    },
    color: 'black',
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: '#e0f2fe', // Tailwind blue-50
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: '#1e40af', // Tailwind blue-800
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: '#1e40af', // Tailwind blue-800
    '&:hover': {
      backgroundColor: '#bfdbfe', // Tailwind blue-200
      color: '#1e3a8a', // Tailwind blue-900
    },
  }),
};

const AttributeSelector: React.FC<{ onAttributesChange: Function }> = ({ onAttributesChange }) => {
  const [attributes, setAttributes] = useState<Attributes>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any[]>>({});

  function toTitleCaseWithSpaces(str: string) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, (firstChar) => firstChar.toUpperCase());
  }

  useEffect(() => {
    const loadAttributes = async () => {
      const attrs = await fetchItemAttributes();
      setAttributes(attrs);
    };
    loadAttributes();
  }, [onAttributesChange]);

  const handleChange = (selected: any, attribute: string) => {
    setSelectedOptions((prevSelected) => ({
      ...prevSelected,
      [attribute]: selected || [],
    }));
    
  };

  const applyFilters = () => {
    onAttributesChange(selectedOptions);
  };

  return (
    <div className="flex flex-col h-full">
          <div className="overflow-y-auto p-4 flex-grow pb-16">
    <div className="space-y-4 p-4">
      {Object.entries(attributes).map(([attribute, options]) => {
        // Transform options for React Select
        const transformedOptions = options.map((option) => ({ value: option, label: toTitleCaseWithSpaces(option) }));
        return (
          <div key={attribute} className="form-control w-full">
            <label className="label">
              <span className="label-text capitalize">{toTitleCaseWithSpaces(attribute)}</span>
            </label>
            <Select
              isMulti
              name={attribute}
              options={transformedOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              styles={customSelectStyles}
              onChange={(selected) => handleChange(selected, attribute)}
              value={selectedOptions[attribute]}
            />
          </div>
        );
      })}
    </div>
    <div className="p-4 bg-white sticky bottom-0 shadow-inner">
            <button
              className="btn btn-primary w-full"
              onClick={() => applyFilters()}
            >
              Apply Filters
            </button>
          </div>
</div>
</div>
);
};

export default AttributeSelector;
