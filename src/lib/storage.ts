import * as FileSystem from 'expo-file-system';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djaa2lddn';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'; 

/**
 * Uploads an image to Cloudinary using the REST API.
 */
export const uploadProofImage = async (uriPath: string, folder: string = 'CleanZone-wastes') => {
  console.log('🚀 [CleanZone] UPLOAD VIA CLOUDINARY (BASE64) - START');
  console.log('📂 Folder:', folder);
  console.log('☁️ Cloud Name:', CLOUD_NAME);

  try {
    // 1. Lire le fichier local en base64 (sûr et compatible avec le scoping de dossier d'Expo)
    const base64Data = await FileSystem.readAsStringAsync(uriPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const fileDataUri = `data:image/jpeg;base64,${base64Data}`;
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    // 2. Envoyer en POST JSON standard pour contourner les limitations de FormData et de décodage natif
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: fileDataUri,
        upload_preset: UPLOAD_PRESET,
        folder: folder,
      }),
    });

    const data = await response.json();

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
