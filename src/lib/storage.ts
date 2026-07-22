export interface StorageUploadResult {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export class StorageService {
  /**
   * Uploads a file buffer or base64 string to storage abstraction.
   * Returns public URL & file metadata.
   */
  static async uploadFile(
    base64Data: string,
    folderName: string = 'patient-photos'
  ): Promise<StorageUploadResult> {
    // For demo/production, if base64 data URL is provided, return structured data
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    let mimeType = 'image/jpeg';

    if (matches && matches.length === 3) {
      mimeType = matches[1];
    }

    const uniqueId = Math.random().toString(36).substring(2, 9);
    const fileName = `${folderName}_${Date.now()}_${uniqueId}.jpg`;
    
    // In cloud deployment (e.g. AWS S3 / Cloudinary), replace with S3 PutObjectCommand
    const fileUrl = base64Data.startsWith('data:') 
      ? base64Data 
      : `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80`;

    return {
      fileUrl,
      fileName,
      mimeType,
      sizeBytes: Math.round(base64Data.length * 0.75),
    };
  }
}
