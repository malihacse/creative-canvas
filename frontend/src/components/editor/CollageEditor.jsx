import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/config';

// Collage templates - predefined layouts
const COLLAGE_TEMPLATES = {
  template2: {
    name: '2 Images',
    slots: [
      { id: 'slot1', x: 0, y: 0, width: 400, height: 600 },
      { id: 'slot2', x: 400, y: 0, width: 400, height: 600 }
    ]
  },
  template3: {
    name: '3 Images (2+1)',
    slots: [
      { id: 'slot1', x: 0, y: 0, width: 400, height: 300 },
      { id: 'slot2', x: 400, y: 0, width: 400, height: 300 },
      { id: 'slot3', x: 0, y: 300, width: 800, height: 300 }
    ]
  },
  template4: {
    name: '4 Images (Grid)',
    slots: [
      { id: 'slot1', x: 0, y: 0, width: 400, height: 300 },
      { id: 'slot2', x: 400, y: 0, width: 400, height: 300 },
      { id: 'slot3', x: 0, y: 300, width: 400, height: 300 },
      { id: 'slot4', x: 400, y: 300, width: 400, height: 300 }
    ]
  },
  template6: {
    name: '6 Images',
    slots: [
      { id: 'slot1', x: 0, y: 0, width: 267, height: 200 },
      { id: 'slot2', x: 267, y: 0, width: 267, height: 200 },
      { id: 'slot3', x: 534, y: 0, width: 266, height: 200 },
      { id: 'slot4', x: 0, y: 200, width: 267, height: 200 },
      { id: 'slot5', x: 267, y: 200, width: 267, height: 200 },
      { id: 'slot6', x: 534, y: 200, width: 266, height: 200 }
    ]
  }
};

const CollageEditor = ({ onCollageGenerated, uploadedImages = [] }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [collageImages, setCollageImages] = useState({});
  const [draggedImage, setDraggedImage] = useState(null);

  // Generate collage on canvas
  const generateCollage = () => {
    if (!selectedTemplate || !onCollageGenerated) return;

    const template = COLLAGE_TEMPLATES[selectedTemplate];
    const collageData = {
      template: selectedTemplate,
      images: collageImages,
      layout: template.slots
    };

    onCollageGenerated(collageData);
  };

  // Handle drag start
  const handleDragStart = (imageData) => {
    setDraggedImage(imageData);
  };

  // Handle drop on slot
  const handleDrop = (slotId) => {
    if (draggedImage) {
      setCollageImages(prev => ({
        ...prev,
        [slotId]: draggedImage
      }));
      setDraggedImage(null);
    }
  };

  // Remove image from slot
  const removeImageFromSlot = (slotId) => {
    setCollageImages(prev => {
      const newImages = { ...prev };
      delete newImages[slotId];
      return newImages;
    });
  };

  // Clear all slots
  const clearCollage = () => {
    setCollageImages({});
  };

  return (
    <div className="collage-editor bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Collage Editor</h3>

      {/* Template Selection */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Choose Template</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(COLLAGE_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                selectedTemplate === key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Available Images */}
      {uploadedImages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Available Images</h4>
          <div className="grid grid-cols-4 gap-2">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(image)}
                className="aspect-square border border-gray-300 rounded cursor-move hover:border-indigo-400 transition-colors overflow-hidden"
              >
                <img
                  src={getImageUrl(image.path)}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Drag images onto the collage slots below
          </p>
        </div>
      )}

      {/* Collage Preview */}
      {selectedTemplate && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-800">
              {COLLAGE_TEMPLATES[selectedTemplate].name} Layout
            </h4>
            <div className="space-x-2">
              <button
                onClick={clearCollage}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded"
              >
                Clear
              </button>
              <button
                onClick={generateCollage}
                className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                Generate Collage
              </button>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div
              className="relative mx-auto bg-white border"
              style={{
                width: '400px',
                height: '300px',
                backgroundImage: `
                  linear-gradient(90deg, #f3f4f6 0px, transparent 1px),
                  linear-gradient(#f3f4f6 0px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            >
              {COLLAGE_TEMPLATES[selectedTemplate].slots.map((slot) => {
                const scale = 400 / 800; // Scale down for preview
                const scaledSlot = {
                  ...slot,
                  x: slot.x * scale,
                  y: slot.y * scale,
                  width: slot.width * scale,
                  height: slot.height * scale
                };

                return (
                  <div
                    key={slot.id}
                    className="absolute border-2 border-dashed border-gray-400 bg-white hover:border-indigo-400 transition-colors cursor-pointer"
                    style={{
                      left: `${scaledSlot.x}px`,
                      top: `${scaledSlot.y}px`,
                      width: `${scaledSlot.width}px`,
                      height: `${scaledSlot.height}px`,
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(slot.id);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {collageImages[slot.id] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={getImageUrl(collageImages[slot.id].path)}
                          alt={`Slot ${slot.id}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImageFromSlot(slot.id)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Drop image here
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            <p>Filled slots: {Object.keys(collageImages).length} / {COLLAGE_TEMPLATES[selectedTemplate].slots.length}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedTemplate && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">Create a Photo Collage</p>
          <p className="text-sm">Select a template above to get started</p>
        </div>
      )}
    </div>
  );
};

export default CollageEditor;
