/**
 * Compress and resize image to reduce payload size for API
 * @param file Original image file
 * @param maxWidth Maximum width in pixels (default: 1920)
 * @param maxHeight Maximum height in pixels (default: 1920)
 * @param quality JPEG quality 0-1 (default: 0.8)
 * @returns Promise resolving to base64 string and mime type
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8,
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 JPEG
        const base64 = canvas.toDataURL("image/jpeg", quality);
        const base64Match = base64.match(/^data:(.+);base64,(.+)$/);
        if (base64Match) {
          resolve({
            base64: base64Match[2],
            mimeType: base64Match[1],
          });
        } else {
          reject(new Error("Failed to extract base64 data"));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      if (typeof e.target?.result === "string") {
        img.src = e.target.result;
      } else {
        reject(new Error("Invalid file data"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file before processing
 * @param file File to validate
 * @param maxSizeBytes Maximum file size in bytes (default: 50MB)
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File, maxSizeBytes = 50 * 1024 * 1024): string | null {
  if (file.size > maxSizeBytes) {
    return `Le fichier est trop volumineux (${Math.round(
      file.size / 1024 / 1024,
    )}MB). Veuillez choisir une image plus petite (max ${Math.round(
      maxSizeBytes / 1024 / 1024,
    )}MB).`;
  }

  if (!file.type.startsWith("image/")) {
    return "Veuillez sélectionner un fichier image (JPG, PNG, etc.)";
  }

  return null;
}
