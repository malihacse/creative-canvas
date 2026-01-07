import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getImageUrl } from '../../utils/config';

const CropTool = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState();
  const imgRef = useRef(null);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;

    // Center a square crop
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50,
        },
        1, // aspect ratio 1:1 (square)
        width,
        height
      ),
      width,
      height
    );

    setCrop(crop);
  }, []);

  const onCropChange = (crop, percentCrop) => {
    setCrop(percentCrop);
  };

  const onCropCompleteHandler = (crop, percentCrop) => {
    setCompletedCrop(percentCrop);
  };

  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const handleApplyCrop = async () => {
    if (!completedCrop) return;

    const croppedBlob = await getCroppedImage();
    if (croppedBlob && onCropComplete) {
      // Create a File object from the blob
      const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      onCropComplete({
        file: croppedFile,
        cropData: completedCrop,
        originalImage: image
      });
    }
  };

  const presetAspects = [
    { label: 'Free', value: undefined },
    { label: '1:1 Square', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16', value: 9 / 16 },
  ];

  const handleAspectChange = (newAspect) => {
    setAspect(newAspect);
    if (!imgRef.current) return;

    const { width, height } = imgRef.current;
    if (newAspect) {
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 50,
          },
          newAspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
    } else {
      // Free aspect ratio
      setCrop({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
      });
    }
  };

  return (
    <div className="crop-tool bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Crop Image</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Aspect Ratio Controls */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aspect Ratio
        </label>
        <div className="flex flex-wrap gap-2">
          {presetAspects.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleAspectChange(preset.value)}
              className={`px-3 py-1 text-sm rounded ${
                aspect === preset.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Area */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
        <ReactCrop
          crop={crop}
          onChange={onCropChange}
          onComplete={onCropCompleteHandler}
          aspect={aspect}
          minWidth={50}
          minHeight={50}
        >
          <img
            ref={imgRef}
            src={image?.path ? getImageUrl(image.path) : image}
            alt="Crop preview"
            onLoad={onImageLoad}
            className="max-w-full h-auto"
            style={{ maxHeight: '60vh' }}
          />
        </ReactCrop>
      </div>

      {/* Crop Info */}
      {completedCrop && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p>Crop dimensions: {Math.round(completedCrop.width)}% × {Math.round(completedCrop.height)}%</p>
          <p>Position: ({Math.round(completedCrop.x)}%, {Math.round(completedCrop.y)}%)</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleApplyCrop}
          disabled={!completedCrop}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
};

export default CropTool;
