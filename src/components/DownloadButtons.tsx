import React, { useState } from 'react';
import { FileDown, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { supabase } from '../db/config';

interface UploadedFile {
  id: string;
  filename: string;
  original_filename: string;
  display_name: string;
  category: 'documents' | 'logos';
  file_path: string;
}

export default function DownloadButtons() {
  const [isOpenDocs, setIsOpenDocs] = useState(false);
  const [isOpenLogos, setIsOpenLogos] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filesLoaded, setFilesLoaded] = useState(false);

  const loadUploadedFiles = async () => {
    if (filesLoaded) return; // Éviter de recharger plusieurs fois
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('id, filename, original_filename, display_name, category, file_path')
        .order('display_name');

      if (error) throw error;
      setUploadedFiles(data || []);
      setFilesLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: 'documents' | 'logos') => {
    if (category === 'documents') {
      setIsOpenDocs(!isOpenDocs);
      if (!isOpenDocs) loadUploadedFiles();
    } else {
      setIsOpenLogos(!isOpenLogos);
      if (!isOpenLogos) loadUploadedFiles();
    }
  };

  const handleStaticDownload = (filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = `/${filename}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
    }
  };

  const handleUploadedFileDownload = async (file: UploadedFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(file.file_path, 60); // URL valable 60s
  
      if (error || !data?.signedUrl) {
        throw new Error("Impossible de générer l'URL signée");
      }
  
      const response = await fetch(data.signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      window.URL.revokeObjectURL(url); // Nettoyage
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
    }
  };
  
  const documentsFiles = uploadedFiles.filter(f => f.category === 'documents');
  const logosFiles = uploadedFiles.filter(f => f.category === 'logos');

  return (
    <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
      {/* MENU DOCUMENTS */}
      <div>
        <button
          onClick={() => handleCategoryToggle('documents')}
          className="flex items-center justify-between w-full text-left text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-700 dark:hover:text-indigo-400 focus:outline-none transition-colors duration-200"
        >
          <span className="flex items-center">
            Documents
            {loading && <Loader className="w-4 h-4 ml-2 animate-spin" />}
          </span>
          {isOpenDocs ? (
            <ChevronUp className="w-5 h-5 ml-2" />
          ) : (
            <ChevronDown className="w-5 h-5 ml-2" />
          )}
        </button>

        {isOpenDocs && (
          <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-slate-600 pt-4">
            
            {/* Fichiers uploadés dans la catégorie documents */}
            {documentsFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => handleUploadedFileDownload(file)}
                className="inline-flex items-center px-4 py-2 w-full text-left border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
              >
                <FileDown className="h-5 w-5 mr-2" />
                {file.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MENU LOGOS */}
      <div>
        <button
          onClick={() => handleCategoryToggle('logos')}
          className="flex items-center justify-between w-full text-left text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-700 dark:hover:text-indigo-400 focus:outline-none transition-colors duration-200"
        >
          <span className="flex items-center">
            Logos
            {loading && <Loader className="w-4 h-4 ml-2 animate-spin" />}
          </span>
          {isOpenLogos ? (
            <ChevronUp className="w-5 h-5 ml-2" />
          ) : (
            <ChevronDown className="w-5 h-5 ml-2" />
          )}
        </button>

        {isOpenLogos && (
          <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-slate-600 pt-4">
            
            {/* Fichiers uploadés dans la catégorie logos */}
            {logosFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => handleUploadedFileDownload(file)}
                className="inline-flex items-center px-4 py-2 w-full text-left border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-200"
              >
                <FileDown className="h-5 w-5 mr-2" />
                {file.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}