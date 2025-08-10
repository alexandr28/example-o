// src/services/uploadService.ts
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename?: string;
    url?: string;
    path?: string;
    size?: number;
    mimetype?: string;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class UploadService {
  private static instance: UploadService;
  private endpoint: string;
  
  private constructor() {
    this.endpoint = API_CONFIG.endpoints.upload.base;
  }
  
  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }
  
  /**
   * Sube un archivo al servidor
   * NO requiere autenticación
   */
  async uploadFile(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      console.log('📤 [UploadService] Subiendo archivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Construir URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      console.log('🌐 [UploadService] URL de upload:', url);
      
      // Crear XMLHttpRequest para manejar progreso
      if (onProgress) {
        return await this.uploadWithProgress(url, formData, onProgress);
      }
      
      // Upload simple sin progreso
      const response = await fetch(url, {
        method: 'POST',
        body: formData
        // NO incluir headers, el navegador los configura automáticamente para FormData
      });
      
      console.log('📡 [UploadService] Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [UploadService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [UploadService] Archivo subido:', responseData);
      
      if (responseData.success) {
        NotificationService.success(`Archivo ${file.name} subido exitosamente`);
      }
      
      return responseData;
      
    } catch (error: any) {
      console.error('❌ [UploadService] Error al subir archivo:', error);
      NotificationService.error(error.message || 'Error al subir el archivo');
      throw error;
    }
  }
  
  /**
   * Sube múltiples archivos
   */
  async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResponse[]> {
    try {
      console.log(`📤 [UploadService] Subiendo ${files.length} archivos`);
      
      const results: UploadResponse[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 [UploadService] Subiendo archivo ${i + 1}/${files.length}: ${file.name}`);
        
        const result = await this.uploadFile(
          file,
          onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        
        results.push(result);
      }
      
      console.log(`✅ [UploadService] Todos los archivos subidos`);
      return results;
      
    } catch (error: any) {
      console.error('❌ [UploadService] Error al subir múltiples archivos:', error);
      throw error;
    }
  }
  
  /**
   * Upload con seguimiento de progreso usando XMLHttpRequest
   */
  private uploadWithProgress(
    url: string, 
    formData: FormData, 
    onProgress: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Configurar listeners
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Error al parsear respuesta del servidor'));
          }
        } else {
          reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir el archivo'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelado'));
      });
      
      // Abrir y enviar request
      xhr.open('POST', url);
      xhr.send(formData);
    });
  }
  
  /**
   * Valida si un archivo es válido para subir
   */
  validateFile(
    file: File, 
    options?: {
      maxSize?: number; // En bytes
      allowedTypes?: string[]; // MIME types
    }
  ): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options || {}; // 10MB por defecto
    
    // Validar tamaño
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `El archivo excede el tamaño máximo permitido (${Math.round(maxSize / 1024 / 1024)}MB)`
      };
    }
    
    // Validar tipo
    if (allowedTypes && allowedTypes.length > 0) {
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
        };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Valida si es una imagen
   */
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }
  
  /**
   * Obtiene la URL de preview para una imagen
   */
  getImagePreviewUrl(file: File): string {
    if (!this.isImage(file)) {
      throw new Error('El archivo no es una imagen');
    }
    return URL.createObjectURL(file);
  }
  
  /**
   * Libera la URL de preview
   */
  releaseImagePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

// Exportar la instancia singleton
const uploadService = UploadService.getInstance();
export default uploadService;

// También exportar la clase para tests
export { UploadService };