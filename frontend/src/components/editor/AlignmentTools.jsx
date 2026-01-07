import React, { useState } from 'react';

const AlignmentTools = ({ canvas, activeObject, showGrid, setShowGrid }) => {
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Rotate functions
  const rotateClockwise = () => {
    if (!canvas || !activeObject) return;
    const angle = activeObject.angle || 0;
    activeObject.set('angle', angle + 90);
    canvas.renderAll();
  };

  const rotateCounterClockwise = () => {
    if (!canvas || !activeObject) return;
    const angle = activeObject.angle || 0;
    activeObject.set('angle', angle - 90);
    canvas.renderAll();
  };

  const rotate180 = () => {
    if (!canvas || !activeObject) return;
    const angle = activeObject.angle || 0;
    activeObject.set('angle', angle + 180);
    canvas.renderAll();
  };

  // Flip functions
  const flipHorizontal = () => {
    if (!canvas || !activeObject) return;
    activeObject.set('flipX', !activeObject.flipX);
    canvas.renderAll();
  };

  const flipVertical = () => {
    if (!canvas || !activeObject) return;
    activeObject.set('flipY', !activeObject.flipY);
    canvas.renderAll();
  };

  // Alignment functions
  const alignLeft = () => {
    if (!canvas || !activeObject) return;
    activeObject.set('left', 0);
    canvas.renderAll();
  };

  const alignCenter = () => {
    if (!canvas || !activeObject) return;
    activeObject.centerH();
    canvas.renderAll();
  };

  const alignRight = () => {
    if (!canvas || !activeObject) return;
    activeObject.set('left', canvas.width - activeObject.width * activeObject.scaleX);
    canvas.renderAll();
  };

  const alignTop = () => {
    if (!canvas || !activeObject) return;
    activeObject.set('top', 0);
    canvas.renderAll();
  };

  const alignMiddle = () => {
    if (!canvas || !activeObject) return;
    activeObject.centerV();
    canvas.renderAll();
  };

  const alignBottom = () => {
    if (!canvas || !activeObject) return;
    activeObject.set('top', canvas.height - activeObject.height * activeObject.scaleY);
    canvas.renderAll();
  };

  // Grid functions
  const toggleGrid = () => {
    setShowGrid(!showGrid);
    drawGrid(!showGrid);
  };

  const drawGrid = (show = showGrid) => {
    if (!canvas) return;

    // Clear existing grid
    const objects = canvas.getObjects();
    const gridLines = objects.filter(obj => obj.id === 'grid-line');
    gridLines.forEach(line => canvas.remove(line));

    if (!show) {
      canvas.renderAll();
      return;
    }

    const gridSize = 50;
    const gridColor = '#e5e7eb';
    const gridOpacity = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
      const line = new window.fabric.Line([x, 0, x, canvas.height], {
        stroke: gridColor,
        strokeWidth: 1,
        selectable: false,
        evented: false,
        opacity: gridOpacity,
        id: 'grid-line'
      });
      canvas.add(line);
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
      const line = new window.fabric.Line([0, y, canvas.width, y], {
        stroke: gridColor,
        strokeWidth: 1,
        selectable: false,
        evented: false,
        opacity: gridOpacity,
        id: 'grid-line'
      });
      canvas.add(line);
    }

    // Send grid to back
    gridLines.forEach(line => canvas.sendToBack(line));
    canvas.renderAll();
  };

  // Snap to grid functionality
  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
    if (canvas) {
      canvas.snapToGrid = !snapToGrid;
    }
  };

  // Reset position
  const resetPosition = () => {
    if (!canvas || !activeObject) return;
    activeObject.set({
      left: (canvas.width - activeObject.width * activeObject.scaleX) / 2,
      top: (canvas.height - activeObject.height * activeObject.scaleY) / 2,
      angle: 0,
      flipX: false,
      flipY: false
    });
    canvas.renderAll();
  };

  return (
    <div className="alignment-tools bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Alignment & Transform</h3>

      {!activeObject ? (
        <div className="text-center py-8 text-gray-500">
          <p>Select an object to use alignment tools</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rotation Tools */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Rotation</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={rotateCounterClockwise}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                title="Rotate -90°"
              >
                ↺ -90°
              </button>
              <button
                onClick={rotate180}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                title="Rotate 180°"
              >
                ↕ 180°
              </button>
              <button
                onClick={rotateClockwise}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                title="Rotate +90°"
              >
                ↻ +90°
              </button>
            </div>
          </div>

          {/* Flip Tools */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Flip</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={flipHorizontal}
                className={`p-2 rounded text-sm font-medium ${
                  activeObject.flipX
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                title="Flip Horizontal"
              >
                ⇄ Horizontal
              </button>
              <button
                onClick={flipVertical}
                className={`p-2 rounded text-sm font-medium ${
                  activeObject.flipY
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                title="Flip Vertical"
              >
                ⇅ Vertical
              </button>
            </div>
          </div>

          {/* Alignment Tools */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Align</h4>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={alignLeft}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm font-medium"
                title="Align Left"
              >
                ⬅ Left
              </button>
              <button
                onClick={alignCenter}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm font-medium"
                title="Align Center"
              >
                ⬌ Center
              </button>
              <button
                onClick={alignRight}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm font-medium"
                title="Align Right"
              >
                ➡ Right
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={alignTop}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm font-medium"
                title="Align Top"
              >
                ⬆ Top
              </button>
              <button
                onClick={alignMiddle}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm font-medium"
                title="Align Middle"
              >
                ⬍ Middle
              </button>
              <button
                onClick={alignBottom}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm font-medium"
                title="Align Bottom"
              >
                ⬇ Bottom
              </button>
            </div>
          </div>

          {/* Grid & Snap Tools */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Grid & Guides</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show Grid</span>
                <button
                  onClick={toggleGrid}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showGrid ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showGrid ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Snap to Grid</span>
                <button
                  onClick={toggleSnapToGrid}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    snapToGrid ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      snapToGrid ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Reset */}
          <div>
            <button
              onClick={resetPosition}
              className="w-full p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium"
              title="Reset position and transforms"
            >
              Reset Position
            </button>
          </div>

          {/* Object Info */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Object Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Position: ({Math.round(activeObject.left || 0)}, {Math.round(activeObject.top || 0)})</p>
              <p>Size: {Math.round((activeObject.width || 0) * (activeObject.scaleX || 1))} × {Math.round((activeObject.height || 0) * (activeObject.scaleY || 1))}</p>
              <p>Rotation: {Math.round(activeObject.angle || 0)}°</p>
              <p>Scale: {((activeObject.scaleX || 1) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlignmentTools;
