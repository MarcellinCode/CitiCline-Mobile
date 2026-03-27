import * as FileSystem from 'expo-file-system';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djaa2lddn';
const UPLOAD_PRESET = 'ml_default'; 

/**
 * Uploads an image to Cloudinary using the REST API.
 */
export const uploadProofImage = async (uriPath: string, folder: string = 'CITICLINE-wastes') => {
  console.log('🚀 [CITICLINE] UPLOAD VIA CLOUDINARY - START');
  console.log('📂 Folder:', folder);
  console.log('☁️ Cloud Name:', CLOUD_NAME);

  try {
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append('file', {
      uri: uriPath,
      type: 'image/jpeg',
      name: `upload-${Date.now()}.jpg`,
    } as any);
    
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ Cloudinary Error message:', data.error.message);
      throw new Error(data.error.message);
    }

    console.log('✅ [CITICLINE] UPLOAD CLOUDINARY RÉUSSI:', data.secure_url);
    return data.secure_url;
  } catch (err) {
    console.error('❌ [CITICLINE] Cloudinary Upload error:', err);
    throw err;
  }
};
