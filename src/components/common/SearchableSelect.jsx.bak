import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';





const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  className = '',
  disabled = false,
  renderOption,
  getOptionLabel,
  getOptionValue,
  emptyMessage = 'No options found'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = options.filter(option => {
        const label = getOptionLabel ? getOptionLabel(option) : option.label || String(option);
        return label.toLowerCase().includes(searchLower);
      });
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, getOptionLabel]);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleSelect = (option) => {
    const optionValue = getOptionValue ? getOptionValue(option) : option.value || option;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  
  const selectedOption = options.find(option => {
    const optionValue = getOptionValue ? getOptionValue(option) : option.value || option;
    return optionValue === value;
  });

  const selectedLabel = selectedOption
    ? (getOptionLabel ? getOptionLabel(selectedOption) : selectedOption.label || String(selectedOption))
    : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between
          px-3 py-2 text-sm
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${!selectedLabel ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}
        `}
      >
        <span className="truncate flex-1 text-left">
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-1 ml-2">
          {value && !disabled && (
            <XMarkIcon
              className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleClear}
            />
          )}
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </button>

      {}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue ? getOptionValue(option) : option.value || option;
                const optionLabel = getOptionLabel ? getOptionLabel(option) : option.label || String(option);
                const isSelected = optionValue === value;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                      transition-colors
                    `}
                  >
                    {renderOption ? renderOption(option) : optionLabel}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

SearchableSelect.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  renderOption: PropTypes.func,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  emptyMessage: PropTypes.string
};

export default SearchableSelect;
