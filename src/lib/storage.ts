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
  console.log('📤 Upload Preset:', UPLOAD_PRESET);

  try {
    // 1. Lire le fichier local en base64 (avec gestion de secours pour les encodages Android/Expo Go)
    let base64Data = '';
    let readError = null;

    const formatsToTry = [
      uriPath,
      decodeURIComponent(uriPath),
      decodeURIComponent(decodeURIComponent(uriPath)),
      uriPath.replace('file://', ''),
      decodeURIComponent(uriPath).replace('file://', ''),
      decodeURIComponent(decodeURIComponent(uriPath)).replace('file://', '')
    ];

    const uniqueFormats = [...new Set(formatsToTry)];

    for (const format of uniqueFormats) {
      try {
        base64Data = await FileSystem.readAsStringAsync(format, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (base64Data) {
          console.log(`✅ Successfully read file using format: ${format}`);
          readError = null;
          break;
        }
      } catch (err) {
        readError = err;
      }
    }

    if (readError) {
      console.error('❌ Failed to read file after trying all URI formats');
      throw readError;
    }

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
        filename_override: `waste_img_${Date.now()}`,
        use_filename_as_display_name: false
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
