import React, { useState, useEffect } from 'react';

const FilterPanel = ({ canvas, activeObject }) => {
  const [filters, setFilters] = useState({
    brightness: 0,    // -100 to 100
    contrast: 0,      // -100 to 100
    saturation: 0,    // -100 to 100
    hue: 0,          // 0 to 360
    blur: 0,          // 0 to 10
    grayscale: false,
    sepia: false,
    invert: false
  });

  // Apply filters to the active object
  const applyFilters = () => {
    if (!canvas || !activeObject) return;

    const fabricFilters = [];

    // Brightness filter
    if (filters.brightness !== 0) {
      fabricFilters.push(new window.fabric.Image.filters.Brightness({
        brightness: filters.brightness / 100
      }));
    }

    // Contrast filter
    if (filters.contrast !== 0) {
      fabricFilters.push(new window.fabric.Image.filters.Contrast({
        contrast: filters.contrast / 100
      }));
    }

    // Saturation filter
    if (filters.saturation !== 0) {
      fabricFilters.push(new window.fabric.Image.filters.Saturation({
        saturation: filters.saturation / 100
      }));
    }

    // Hue rotation
    if (filters.hue !== 0) {
      fabricFilters.push(new window.fabric.Image.filters.HueRotation({
        rotation: filters.hue / 180 * Math.PI
      }));
    }

    // Blur filter
    if (filters.blur > 0) {
      fabricFilters.push(new window.fabric.Image.filters.Blur({
        blur: filters.blur / 10
      }));
    }

    // Grayscale filter
    if (filters.grayscale) {
      fabricFilters.push(new window.fabric.Image.filters.Grayscale());
    }

    // Sepia filter
    if (filters.sepia) {
      fabricFilters.push(new window.fabric.Image.filters.Sepia());
    }

    // Invert filter
    if (filters.invert) {
      fabricFilters.push(new window.fabric.Image.filters.Invert());
    }

    // Apply filters to the object
    activeObject.filters = fabricFilters;
    activeObject.applyFilters();
    canvas.renderAll();
  };

  // Update filters when any slider changes
  useEffect(() => {
    applyFilters();
  }, [filters, activeObject, canvas]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      grayscale: false,
      sepia: false,
      invert: false
    });
  };

  // Filter slider component
  const FilterSlider = ({ label, value, min, max, step = 1, onChange }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  // Filter checkbox component
  const FilterCheckbox = ({ label, checked, onChange }) => (
    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      <label className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
  );

  return (
    <div className="filter-panel bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Image Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Reset All
        </button>
      </div>

      {!activeObject || activeObject.type !== 'image' ? (
        <div className="text-center py-8 text-gray-500">
          <p>Select an image to apply filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Adjustment Filters */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Adjustments</h4>
            <FilterSlider
              label="Brightness"
              value={filters.brightness}
              min={-100}
              max={100}
              onChange={(value) => handleFilterChange('brightness', value)}
            />
            <FilterSlider
              label="Contrast"
              value={filters.contrast}
              min={-100}
              max={100}
              onChange={(value) => handleFilterChange('contrast', value)}
            />
            <FilterSlider
              label="Saturation"
              value={filters.saturation}
              min={-100}
              max={100}
              onChange={(value) => handleFilterChange('saturation', value)}
            />
            <FilterSlider
              label="Hue Rotation"
              value={filters.hue}
              min={0}
              max={360}
              onChange={(value) => handleFilterChange('hue', value)}
            />
          </div>

          {/* Effects */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Effects</h4>
            <FilterSlider
              label="Blur"
              value={filters.blur}
              min={0}
              max={10}
              step={0.1}
              onChange={(value) => handleFilterChange('blur', value)}
            />
          </div>

          {/* Presets */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Presets</h4>
            <div className="space-y-2">
              <FilterCheckbox
                label="Grayscale"
                checked={filters.grayscale}
                onChange={(checked) => handleFilterChange('grayscale', checked)}
              />
              <FilterCheckbox
                label="Sepia"
                checked={filters.sepia}
                onChange={(checked) => handleFilterChange('sepia', checked)}
              />
              <FilterCheckbox
                label="Invert Colors"
                checked={filters.invert}
                onChange={(checked) => handleFilterChange('invert', checked)}
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Quick Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilters({
                  brightness: 20,
                  contrast: 30,
                  saturation: 10,
                  hue: 0,
                  blur: 0,
                  grayscale: false,
                  sepia: false,
                  invert: false
                })}
                className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
              >
                Bright & Vibrant
              </button>
              <button
                onClick={() => setFilters({
                  brightness: -20,
                  contrast: 40,
                  saturation: -30,
                  hue: 0,
                  blur: 0,
                  grayscale: false,
                  sepia: false,
                  invert: false
                })}
                className="px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded"
              >
                Dramatic
              </button>
              <button
                onClick={() => setFilters({
                  brightness: 10,
                  contrast: -20,
                  saturation: -10,
                  hue: 0,
                  blur: 0.5,
                  grayscale: false,
                  sepia: false,
                  invert: false
                })}
                className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded"
              >
                Soft & Dreamy
              </button>
              <button
                onClick={() => setFilters({
                  brightness: -30,
                  contrast: 50,
                  saturation: -50,
                  hue: 0,
                  blur: 0,
                  grayscale: false,
                  sepia: true,
                  invert: false
                })}
                className="px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded"
              >
                Vintage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
