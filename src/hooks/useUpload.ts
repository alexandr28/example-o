// src/hooks/useUpload.ts
import { useState, useCallback } from 'react';
import uploadService, { UploadResponse, UploadProgress } from '../services/uploadService';

export interface UseUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  onSuccess?: (response: UploadResponse | UploadResponse[]) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UseUploadReturn {
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadedFiles: UploadResponse[];
  uploadFile: (file: File) => Promise<UploadResponse | null>;
  uploadMultipleFiles: (files: File[]) => Promise<UploadResponse[]>;
  validateFile: (file: File) => { valid: boolean; error?: string };
  reset: () => void;
}

export const useUpload = (options: UseUploadOptions = {}): UseUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
  
  const {
    maxSize = 10 * 1024 * 1024, // 10MB por defecto
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess,
    onError,
    onProgress
  } = options;
  
  /**
   * Valida un archivo antes de subirlo
   */
  const validateFile = useCallback((file: File) => {
    return uploadService.validateFile(file, { maxSize, allowedTypes });
  }, [maxSize, allowedTypes]);
  
  /**
   * Sube un único archivo
   */
  const uploadFile = useCallback(async (file: File): Promise<UploadResponse | null> => {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      if (onError) {
        onError(new Error(validation.error));
      }
      return null;
    }
    
    setUploading(true);
    setError(null);
    setProgress(null);
    
    try {
      const response = await uploadService.uploadFile(
        file,
        (uploadProgress) => {
          setProgress(uploadProgress);
          if (onProgress) {
            onProgress(uploadProgress);
          }
        }
      );
      
      if (response.success) {
        setUploadedFiles(prev => [...prev, response]);
        if (onSuccess) {
          onSuccess(response);
        }
      }
      
      return response;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al subir el archivo';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      return null;
      
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [validateFile, onSuccess, onError, onProgress]);
  
  /**
   * Sube múltiples archivos
   */
  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<UploadResponse[]> => {
    // Validar todos los archivos primero
    const invalidFiles: string[] = [];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      }
    }
    
    if (invalidFiles.length > 0) {
      const errorMessage = `Archivos no válidos:\n${invalidFiles.join('\n')}`;
      setError(errorMessage);
      if (onError) {
        onError(new Error(errorMessage));
      }
      return [];
    }
    
    setUploading(true);
    setError(null);
    setProgress(null);
    
    try {
      const responses = await uploadService.uploadMultipleFiles(
        files,
        (fileIndex, uploadProgress) => {
          // Calcular progreso total
          const totalProgress: UploadProgress = {
            loaded: (fileIndex * 100) + uploadProgress.percentage,
            total: files.length * 100,
            percentage: Math.round(((fileIndex * 100) + uploadProgress.percentage) / files.length)
          };
          setProgress(totalProgress);
          if (onProgress) {
            onProgress(totalProgress);
          }
        }
      );
      
      const successfulUploads = responses.filter(r => r.success);
      setUploadedFiles(prev => [...prev, ...successfulUploads]);
      
      if (onSuccess) {
        onSuccess(responses);
      }
      
      return responses;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al subir los archivos';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      return [];
      
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [validateFile, onSuccess, onError, onProgress]);
  
  /**
   * Resetea el estado del hook
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
    setUploadedFiles([]);
  }, []);
  
  return {
    uploading,
    progress,
    error,
    uploadedFiles,
    uploadFile,
    uploadMultipleFiles,
    validateFile,
    reset
  };
};

export default useUpload;