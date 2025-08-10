import React, { useState } from 'react';
import { Upload, File, Image } from 'lucide-react';

interface UploadZoneProps {
  onFileUpload: (file: File, displayName: string, category: 'documents' | 'logos') => Promise<void>;
  uploading: boolean;
}

export function UploadZone({ onFileUpload, uploading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<'documents' | 'logos'>('documents');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setDisplayName(file.name.split('.')[0]);
      // Auto-détection de la catégorie
      setCategory(file.type.startsWith('image/') ? 'logos' : 'documents');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDisplayName(file.name.split('.')[0]);
      // Auto-détection de la catégorie
      setCategory(file.type.startsWith('image/') ? 'logos' : 'documents');
      event.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !displayName.trim()) {
      return;
    }

    await onFileUpload(selectedFile, displayName.trim(), category);
    
    // Reset form
    setSelectedFile(null);
    setDisplayName('');
    setCategory('documents');
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDisplayName('');
    setCategory('documents');
  };

  // Si un fichier est sélectionné, afficher le formulaire
  if (selectedFile) {
    return (
      <div className="mb-8 p-6 border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            {selectedFile.type.startsWith('image/') ? (
              <Image className="h-8 w-8 text-blue-500" />
            ) : (
              <File className="h-8 w-8 text-gray-500" />
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Fichier sélectionné
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom d'affichage *
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
              placeholder="Nom qui sera affiché dans la liste"
              required
              disabled={uploading}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'documents' | 'logos')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
              disabled={uploading}
            >
              <option value="documents">📄 Documents</option>
              <option value="logos">🎨 Logos</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={uploading || !displayName.trim()}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader le fichier
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Zone de drag & drop par défaut
  return (
    <div 
      className={`mb-8 p-6 border-2 border-dashed rounded-lg transition-colors ${
        dragActive 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-gray-300 dark:border-gray-600'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
              {dragActive ? 'Déposez le fichier ici' : 'Cliquez pour uploader ou glissez un fichier'}
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileSelect}
              disabled={uploading}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.svg"
            />
          </label>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            PDF, PNG, JPG, GIF, SVG jusqu'à 10MB
          </p>
        </div>
      </div>
    </div>
  );
}