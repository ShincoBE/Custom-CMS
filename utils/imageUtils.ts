
import imageCompression from 'browser-image-compression';

export const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

/**
 * Checks if a file is larger than the max allowed size.
 * If so, resizes and compresses it client-side.
 * Returns the original file if small enough or if compression fails.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
    try {
        // Clean up filename to ensure ASCII safety
        const safeName = (file.name || 'upload.jpg')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '_');

        // If file is already small (under 2MB) and not HEIC, return file with safe name
        if (file.size <= 2 * 1024 * 1024 && !file.type.includes('heic')) {
            return new File([file], safeName, { type: file.type || 'image/jpeg' });
        }

        const options = {
            maxSizeMB: 2.0,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.8,
        };

        const compressedBlob = await imageCompression(file, options);

        return new File([compressedBlob], safeName, {
            type: compressedBlob.type || 'image/jpeg',
            lastModified: Date.now(),
        });
    } catch (error) {
        console.warn('Client-side compression warning/failed, using original file:', error);
        return file;
    }
}

