import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

const ImageUpload = ({ onImageUpload, maxFiles = 1 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();

      if (maxFiles === 1) {
        // Single file upload
        formData.append('image', acceptedFiles[0]);

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        if (response.data.success) {
          onImageUpload(response.data.data);
        } else {
          setError(response.data.message || 'Upload failed');
        }
      } else {
        // Multiple files upload
        acceptedFiles.forEach((file, index) => {
          formData.append('images', file);
        });

        const response = await api.post('/upload/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        if (response.data.success) {
          onImageUpload(response.data.data);
        } else {
          setError(response.data.message || 'Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [maxFiles, onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <div>
              <p className="text-lg font-medium text-gray-900">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the image here' : 'Upload an image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {maxFiles === 1
                  ? 'Drag & drop an image here, or click to browse'
                  : `Drag & drop up to ${maxFiles} images here, or click to browse`
                }
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPEG, PNG, GIF, WebP (max 10MB)
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Choose File{maxFiles > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
