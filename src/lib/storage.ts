import * as FileSystem from 'expo-file-system/legacy';

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

    const rawFormats = [
      uriPath,
      uriPath.includes('%25') ? uriPath : uriPath.replace(/%/g, '%25'),
      decodeURIComponent(uriPath),
      decodeURIComponent(decodeURIComponent(uriPath))
    ];

    const formatsToTry = rawFormats.map(f => {
      if (f.startsWith('file://')) return f;
      if (f.startsWith('/')) return `file://${f}`;
      return `file://${f}`;
    });

    const uniqueFormats = [...new Set(formatsToTry)];

    const cacheDir = FileSystem.cacheDirectory;
    if (cacheDir) {
      console.log('🔍 [CleanZone] Cache Directory:', cacheDir);
      try {
        const cacheDirContent = await FileSystem.readDirectoryAsync(cacheDir);
        console.log('🔍 [CleanZone] Cache Dir Contents:', cacheDirContent);
        
        // We also check for decoded versions of cache directory
        const decodedCache = decodeURIComponent(cacheDir);
        console.log('🔍 [CleanZone] Decoded Cache Directory:', decodedCache);
        
        const hasImagePicker = cacheDirContent.includes('ImagePicker') || 
                               cacheDirContent.some(f => f.toLowerCase().includes('imagepicker'));
                               
        if (hasImagePicker) {
          const pickerDir = cacheDir + 'ImagePicker/';
          const pickerDirContent = await FileSystem.readDirectoryAsync(pickerDir);
          console.log('🔍 [CleanZone] ImagePicker Dir Contents:', pickerDirContent);
        } else {
          // Let's try reading the decoded path's ImagePicker
          try {
            const pickerDirContent = await FileSystem.readDirectoryAsync(decodedCache + 'ImagePicker/');
            console.log('🔍 [CleanZone] Decoded ImagePicker Dir Contents:', pickerDirContent);
          } catch (innerErr) {
            // Ignore inner error
          }
        }
      } catch (e: any) {
        console.warn('🔍 [CleanZone] Cache diagnostic error:', e.message);
      }
    } else {
      console.log('🔍 [CleanZone] Cache Directory is null!');
    }

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
        filename_override: `waste_img_${Date.now()}`
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
