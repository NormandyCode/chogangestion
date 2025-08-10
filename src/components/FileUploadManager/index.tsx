import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, File } from 'lucide-react';
import { supabase } from '../../db/config';
import { UploadedFile } from './types';
import { UploadZone } from './UploadZone';
import { FilesList } from './FilesList';

export default function FileUploadManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des fichiers...');

      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement:', error);
        throw error;
      }

      console.log('✅ Fichiers chargés:', data?.length || 0);
      setFiles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, displayName: string, category: 'documents' | 'logos') => {

    try {
      setUploading(true);
      console.log('🚀 Début upload:', { name: file.name, size: file.size, type: file.type });

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${category}/${fileName}`;

      // Upload vers Supabase Storage (bucket public)
      console.log('📤 Upload vers Storage public...');
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erreur Storage:', uploadError);
        throw new Error(`Erreur Storage: ${uploadError.message} (Code: ${uploadError.statusCode})`);
      }

      console.log('✅ Upload Storage réussi');

      // Enregistrer en base de données
      console.log('💾 Enregistrement en base...');
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: insertData, error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          filename: fileName,
          original_filename: file.name,
          display_name: displayName,
          category: category,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: userData.user?.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Erreur DB:', dbError);
        // Nettoyer le fichier uploadé en cas d'erreur DB
        await supabase.storage.from('files').remove([filePath]);
        throw new Error(`Erreur base de données: ${dbError.message}`);
      }

      console.log('✅ Enregistrement DB réussi:', insertData);
      toast.success('Fichier uploadé avec succès !');
      await loadFiles();

    } catch (error: any) {
      console.error('💥 Erreur complète:', error);
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      console.log('⬇️ Téléchargement:', file.display_name);
      
      const { data } = supabase.storage
        .from('files')
        .getPublicUrl(file.file_path);

      if (!data.publicUrl) {
        throw new Error('Impossible de générer l\'URL publique');
      }

      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = file.original_filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Téléchargement démarré');
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      const fileToDelete = files.find(f => f.id === fileId);
      if (!fileToDelete) {
        toast.error('Fichier introuvable');
        return;
      }

      console.log('🗑️ Suppression:', fileToDelete.display_name);

      // Supprimer de Storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([fileToDelete.file_path]);

      if (storageError) {
        console.error('❌ Erreur suppression Storage:', storageError);
      }

      // Supprimer de la base
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        console.error('❌ Erreur suppression DB:', dbError);
        throw dbError;
      }

      toast.success('Fichier supprimé avec succès');
      await loadFiles();
    } catch (error) {
      console.error('Erreur de suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Chargement des fichiers...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des fichiers
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Uploadez et gérez vos documents et logos (bucket public)
        </p>
      </div>

      <UploadZone 
        onFileUpload={handleFileUpload}
        uploading={uploading}
      />

      <FilesList 
        files={files}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
}