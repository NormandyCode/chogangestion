import React from 'react';
import { Download, Trash2, File, Image } from 'lucide-react';
import { UploadedFile } from './types';

interface FilesListProps {
  files: UploadedFile[];
  onDownload: (file: UploadedFile) => void;
  onDelete: (fileId: string) => void;
}

export function FilesList({ files, onDownload, onDelete }: FilesListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Fichiers uploadés ({files.length})
      </h3>
      
      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <File className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Aucun fichier uploadé</p>
          <p className="text-sm">Commencez par uploader votre premier fichier</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.mime_type)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {file.display_name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.original_filename} • {formatFileSize(file.file_size)}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      file.category === 'logos' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {file.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(file.uploaded_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onDownload(file)}
                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(file.id)}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}