import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { ImageFile } from '../types';

interface UploadAreaProps {
  images: ImageFile[];
  onImagesSelected: (files: FileList | null) => void;
  onRemoveImage: (id: string) => void;
  disabled: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ images, onImagesSelected, onRemoveImage, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      onImagesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' : 'cursor-pointer bg-white border-emerald-400 hover:bg-emerald-50 hover:border-emerald-500 hover:shadow-md'}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={(e) => onImagesSelected(e.target.files)}
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Upload Food Photos</h3>
            <p className="text-slate-500 mt-1">Drag & drop or click to scan your pantry, fridge, or freezer</p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
              <img 
                src={img.previewUrl} 
                alt="Upload preview" 
                className="w-full h-full object-cover" 
              />
              {!disabled && (
                <button
                  onClick={() => onRemoveImage(img.id)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
                >
                  <X size={16} />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center text-white text-xs">
                  <ImageIcon size={12} className="mr-1" />
                  <span className="truncate">{img.file.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};