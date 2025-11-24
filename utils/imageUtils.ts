
export const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

/**
 * Checks if a file is larger than the max allowed size.
 * If so, resizes and compresses it (Client-side).
 * Returns the original file if small enough, or a compressed File object.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
    if (file.size <= MAX_FILE_SIZE) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1920;
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG at 70% quality
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'));
                        return;
                    }

                    // Create a new File object
                    // Note: We keep the original name to avoid confusion, though content is now JPEG
                    const newFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    resolve(newFile);
                }, 'image/jpeg', 0.7);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
