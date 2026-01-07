import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { getImageUrl } from '../../utils/config';

const CanvasEditor = ({
  image,
  width = 800,
  height = 600,
  onCanvasReady,
  onObjectModified
}) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  useEffect(() => {
    if (!canvasRef.current || !canvasRef.current.parentNode) return;

    // If canvas already exists and dimensions haven't changed, skip re-initialization
    if (fabricCanvasRef.current && fabricCanvasRef.current.width === width && fabricCanvasRef.current.height === height) {
      return;
    }

    // Dispose of existing canvas if it exists
    if (fabricCanvasRef.current && typeof fabricCanvasRef.current.dispose === 'function') {
      try {
        fabricCanvasRef.current.dispose();
      } catch (error) {
        console.warn('Error disposing canvas:', error);
      }
    }

    // Ensure canvas element is properly sized
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // Initialize Fabric.js canvas with error handling
    let fabricCanvas;
    try {
      fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: width,
        height: height,
        backgroundColor: '#f8f9fa',
        selection: true,
        preserveObjectStacking: true,
        isDrawingMode: false
      });
    } catch (error) {
      console.error('Error initializing Fabric.js canvas:', error);
      return;
    }

    // Configure brush
    try {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushWidth;

      fabricCanvasRef.current = fabricCanvas;
      setCanvas(fabricCanvas);

      // Notify parent component that canvas is ready
      if (onCanvasReady) {
        onCanvasReady(fabricCanvas);
      }

      // Set up event listeners
      fabricCanvas.on('object:modified', (e) => {
        if (onObjectModified) {
          onObjectModified(e.target);
        }
      });

      fabricCanvas.on('selection:created', (e) => {
        console.log('Object selected:', e.target);
      });

      fabricCanvas.on('selection:cleared', () => {
        console.log('Selection cleared');
      });
    } catch (error) {
      console.error('Error configuring canvas:', error);
      // Try to dispose of the partially initialized canvas
      try {
        fabricCanvas.dispose();
      } catch (disposeError) {
        console.warn('Error disposing partially initialized canvas:', disposeError);
      }
      return;
    }

  }, [width, height, onCanvasReady, onObjectModified]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current && typeof fabricCanvasRef.current.dispose === 'function') {
        try {
          fabricCanvasRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing canvas on unmount:', error);
        }
      }
    };
  }, []);

  // Load image when image prop changes
  useEffect(() => {
    if (!canvas || !image) return;

    // Check if canvas is properly initialized
    const canvasElement = canvas.getElement && canvas.getElement();
    if (!canvasElement || !canvasElement.getContext) {
      console.warn('Canvas not properly initialized, skipping image load');
      return;
    }

    try {
      // Clear existing objects
      canvas.clear();
      canvas.setBackgroundColor('#f8f9fa', canvas.renderAll.bind(canvas));
    } catch (error) {
      console.error('Error clearing canvas:', error);
      return;
    }

    // Load new image with error handling
    fabric.Image.fromURL(getImageUrl(image.path), (img) => {
      // Check if image loaded successfully
      if (!img || !img.getElement) {
        console.error('Failed to load image into canvas');
        return;
      }
      // Scale image to fit canvas while maintaining aspect ratio
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up small images

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvas.width - img.width * scale) / 2,
        top: (canvas.height - img.height * scale) / 2,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  }, [canvas, image]);

  // Canvas control methods that can be called from parent
  const addImage = (imageData) => {
    if (!canvas) return;

    fabric.Image.fromURL(getImageUrl(imageData.path), (img) => {
      img.set({
        left: Math.random() * (canvas.width - img.width),
        top: Math.random() * (canvas.height - img.height),
        selectable: true,
        hasControls: true,
        hasBorders: true
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.setBackgroundColor('#f8f9fa', canvas.renderAll.bind(canvas));
  };

  const getCanvasData = () => {
    if (!canvas) return null;
    return canvas.toJSON();
  };

  const loadCanvasData = (data) => {
    if (!canvas) return;
    canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
  };

  // Update brush settings when they change
  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.isDrawingMode = drawingMode;
    }
  }, [canvas, brushColor, brushWidth, drawingMode]);

  // Expose methods to parent component
  useEffect(() => {
    if (canvas && onCanvasReady) {
      canvas.addImage = addImage;
      canvas.clearCanvas = clearCanvas;
      canvas.getCanvasData = getCanvasData;
      canvas.loadCanvasData = loadCanvasData;
    }
  }, [canvas, onCanvasReady]);

  return (
    <div className="canvas-editor">
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Canvas Controls */}
      <div className="mt-4 space-y-4">
        {/* Drawing Tools */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setDrawingMode(!drawingMode)}
            className={`px-3 py-2 text-sm rounded ${
              drawingMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {drawingMode ? 'Exit Drawing' : 'Draw'}
          </button>

          {drawingMode && (
            <>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Color:</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Size:</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">{brushWidth}px</span>
              </div>
            </>
          )}
        </div>

        {/* General Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => canvas && canvas.clearCanvas()}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Clear Canvas
          </button>

          <button
            onClick={() => canvas && canvas.getActiveObject()?.remove()}
            className="px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
          >
            Delete Selected
          </button>

          <button
            onClick={() => canvas && canvas.discardActiveObject()}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Deselect
          </button>
        </div>
      </div>

      {/* Canvas Info */}
      {canvas && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Objects: {canvas.getObjects().length}</p>
          {canvas.getActiveObject() && (
            <p>Selected: {canvas.getActiveObject().type}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;
