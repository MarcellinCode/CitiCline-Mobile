import * as FileSystem from 'expo-file-system';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djaa2lddn';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'; 

/**
 * Uploads an image to Cloudinary using the REST API.
 */
export const uploadProofImage = async (uriPath: string, folder: string = 'CleanZone-wastes') => {
  console.log('🚀 [CleanZone] UPLOAD VIA CLOUDINARY - START');
  console.log('📂 Folder:', folder);
  console.log('☁️ Cloud Name:', CLOUD_NAME);

  try {
    const decodedUri = decodeURIComponent(uriPath);
    console.log('📄 Decoded URI Path:', decodedUri);
    
    const fileInfo = await FileSystem.getInfoAsync(decodedUri);
    console.log('ℹ️ Decoded File Info:', fileInfo);

    const fileInfoOrig = await FileSystem.getInfoAsync(uriPath);
    console.log('ℹ️ Original File Info:', fileInfoOrig);

    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const response = await FileSystem.uploadAsync(apiUrl, decodedUri, {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      parameters: {
        upload_preset: UPLOAD_PRESET,
        folder: folder,
      },
    });

    const data = JSON.parse(response.body);

    if (data.error) {
      console.error('❌ Cloudinary Error message:', data.error.message);
      throw new Error(data.error.message);
    }

    console.log('✅ [CleanZone] UPLOAD CLOUDINARY RÉUSSI:', data.secure_url);
    return data.secure_url;
  } catch (err) {
    console.error('❌ [CleanZone] Cloudinary Upload error:', err);
    throw err;
  }
};
