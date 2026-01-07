import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { projectApi } from '../services/projectApi';
import { getImageUrl } from '../utils/config';
import api from '../services/api';
import ImageUpload from '../components/editor/ImageUpload';
import CanvasEditor from '../components/editor/CanvasEditor';
import CropTool from '../components/editor/CropTool';
import FilterPanel from '../components/editor/FilterPanel';
import AlignmentTools from '../components/editor/AlignmentTools';
import CollageEditor from '../components/editor/CollageEditor';

const Editor = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [projectName, setProjectName] = useState(projectId ? 'Loading...' : 'Untitled Project');
  const [showCropTool, setShowCropTool] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [editorMode, setEditorMode] = useState('single'); // 'single' or 'collage'
  const [uploadedImages, setUploadedImages] = useState([]); // For collage mode
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const canvasRef = useRef(null);

  // Load project data if editing existing project
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  // Load image into canvas when currentImage changes
  useEffect(() => {
    if (canvas && currentImage && editorMode === 'single') {
      loadImageIntoCanvas(currentImage);
    }
  }, [canvas, currentImage, editorMode]);

  // Load image into canvas when uploadedImages changes in collage mode
  useEffect(() => {
    if (canvas && uploadedImages.length > 0 && editorMode === 'collage') {
      // For collage mode, let the CollageEditor component handle loading
      // This effect is just to ensure canvas is ready
    }
  }, [canvas, uploadedImages, editorMode]);

  const loadProject = async (id) => {
    try {
      setIsLoadingProject(true);
      const response = await projectApi.getProject(id);
      const project = response.data;

      setCurrentProjectId(id);
      setProjectName(project.name);

      // Load project data if available
      if (project.project_data) {
        // TODO: Restore canvas state from project_data
        console.log('Project data to restore:', project.project_data);
      }

      // Load associated images
      if (project.images && project.images.length > 0) {
        if (project.project_data?.mode === 'collage') {
          setEditorMode('collage');
          setUploadedImages(project.images.map(img => ({
            path: img.image_path,
            filename: img.image_path.split('/').pop(),
            size: 0, // Would need to get from filesystem
            width: 0,
            height: 0
          })));
        } else {
          // Single image mode
          const mainImage = project.images[0];
          if (mainImage) {
            setCurrentImage({
              path: mainImage.image_path,
              filename: mainImage.image_path.split('/').pop(),
              size: 0,
              width: 0,
              height: 0
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
      navigate('/dashboard');
    } finally {
      setIsLoadingProject(false);
    }
  };

  const loadImageIntoCanvas = (imageData) => {
    if (!canvas) return;

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
    window.fabric.Image.fromURL(getImageUrl(imageData.path), (img) => {
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
      canvas.renderAll();
      setHasUnsavedChanges(true);
    });
  };

  const handleImageUpload = (imageData) => {
    if (editorMode === 'collage') {
      // For collage mode, add to uploaded images array
      setUploadedImages(prev => [...prev, imageData]);
    } else {
      // For single image mode, set as current image
      setCurrentImage(imageData);
    }
  };

  const handleCropImage = () => {
    if (currentImage) {
      setImageToCrop(currentImage);
      setShowCropTool(true);
    }
  };

  const handleCropComplete = async (cropResult) => {
    try {
      // Upload the cropped image
      const formData = new FormData();
      formData.append('image', cropResult.file);

      const response = await fetch(`${api.defaults.baseURL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setCurrentImage(data.data);
        setShowCropTool(false);
        setImageToCrop(null);
      } else {
        alert('Failed to save cropped image');
      }
    } catch (error) {
      console.error('Crop upload error:', error);
      alert('Failed to save cropped image');
    }
  };

  const handleCancelCrop = () => {
    setShowCropTool(false);
    setImageToCrop(null);
  };

  const handleCollageGenerated = (collageData) => {
    if (!canvas) return;

    // Clear canvas
    canvas.clear();
    canvas.setBackgroundColor('#f8f9fa', canvas.renderAll.bind(canvas));

    // Create collage on canvas
    const { template, images, layout } = collageData;

    layout.forEach((slot) => {
      const imageData = images[slot.id];
      if (imageData) {
        window.fabric.Image.fromURL(getImageUrl(imageData.path), (img) => {
          // Scale image to fit slot
          const scaleX = slot.width / img.width;
          const scaleY = slot.height / img.height;
          const scale = Math.min(scaleX, scaleY);

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: slot.x + (slot.width - img.width * scale) / 2,
            top: slot.y + (slot.height - img.height * scale) / 2,
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
          canvas.renderAll();
        });
      }
    });
  };

  const handleCanvasReady = (canvasInstance) => {
    setCanvas(canvasInstance);
    canvasRef.current = canvasInstance;
  };

  const handleSaveProject = async () => {
    try {
      if (!canvas) return;

      // Prepare project data
      const canvasData = canvas.getCanvasData();
      const projectData = {
        mode: editorMode,
        canvasData: canvasData,
        images: editorMode === 'single' ? [currentImage] : uploadedImages,
        timestamp: new Date().toISOString()
      };

      if (currentProjectId) {
        // Update existing project
        await projectApi.updateProject(currentProjectId, {
          name: projectName,
          project_data: projectData
        });
      } else {
        // Create new project
        const response = await projectApi.createProject({
          name: projectName,
          project_data: projectData
        });
        setCurrentProjectId(response.data.id);

        // Generate thumbnail
        try {
          await projectApi.generateThumbnail(response.data.id);
        } catch (thumbnailError) {
          console.warn('Failed to generate thumbnail:', thumbnailError);
        }
      }

      setHasUnsavedChanges(false);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                ← Back to Dashboard
              </button>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.username}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditorMode('single')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    editorMode === 'single'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Single Image
                </button>
                <button
                  onClick={() => setEditorMode('collage')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    editorMode === 'collage'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Collage
                </button>
                <button
                  onClick={handleSaveProject}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upload Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editorMode === 'collage' ? 'Upload Images' : 'Upload Image'}
                </h3>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  maxFiles={editorMode === 'collage' ? 10 : 1}
                />

                {editorMode === 'single' && currentImage && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Current Image</h4>
                      <button
                        onClick={handleCropImage}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                      >
                        Crop
                      </button>
                    </div>
                    <div className="border rounded p-2 bg-gray-50">
                      <img
                        src={getImageUrl(currentImage.path)}
                        alt="Current"
                        className="w-full h-auto rounded"
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <p>Size: {Math.round(currentImage.size / 1024)} KB</p>
                        <p>Dimensions: {currentImage.width} × {currentImage.height}</p>
                      </div>
                    </div>
                  </div>
                )}

                {editorMode === 'collage' && uploadedImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Uploaded Images ({uploadedImages.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="aspect-square border rounded overflow-hidden">
                          <img
                            src={getImageUrl(image.path)}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mode-specific tools */}
              {editorMode === 'single' ? (
                <>
                  {/* Filter Panel */}
                  <FilterPanel
                    canvas={canvas}
                    activeObject={canvas?.getActiveObject()}
                  />

                  {/* Alignment Tools */}
                  <AlignmentTools
                    canvas={canvas}
                    activeObject={canvas?.getActiveObject()}
                    showGrid={showGrid}
                    setShowGrid={setShowGrid}
                  />
                </>
              ) : (
                /* Collage Editor */
                <CollageEditor
                  onCollageGenerated={handleCollageGenerated}
                  uploadedImages={uploadedImages}
                />
              )}
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Canvas Editor</h3>

                {(editorMode === 'single' && !currentImage) || (editorMode === 'collage' && uploadedImages.length === 0) ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Upload an image to start editing</p>
                  </div>
                ) : (
                  <CanvasEditor
                    image={currentImage}
                    onCanvasReady={handleCanvasReady}
                    onObjectModified={(obj) => {
                      console.log('Object modified:', obj);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Crop Tool Modal */}
      {showCropTool && imageToCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <CropTool
            image={imageToCrop}
            onCropComplete={handleCropComplete}
            onCancel={handleCancelCrop}
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
