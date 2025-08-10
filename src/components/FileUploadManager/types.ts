export interface UploadedFile {
  id: string;
  filename: string;
  original_filename: string;
  display_name: string;
  category: 'documents' | 'logos';
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  file_path: string;
}