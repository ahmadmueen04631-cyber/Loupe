export const ALL_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_BYTES = 40 * 1024 * 1024; // 40 MB

export const MIME_LABEL: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "application/pdf": "PDF",
};

export function validateFile(file: File, acceptedTypes: string[] = ALL_IMAGE_TYPES, acceptedExtensions?: string[]): string | null {
  // Some browsers report an empty or generic type for formats they don't natively recognize (HEIC in
  // particular), so fall back to checking the file extension when one is provided.
  const matchesType = acceptedTypes.includes(file.type);
  const matchesExtension = acceptedExtensions?.some((ext) => file.name.toLowerCase().endsWith(ext.toLowerCase()));
  if (!matchesType && !matchesExtension) {
    const labels = acceptedTypes.map((t) => MIME_LABEL[t] ?? t).join(" or ");
    return `That doesn't look like a ${labels} file.`;
  }
  if (file.size > MAX_FILE_BYTES) return "That file is larger than 40 MB. Try a smaller image.";
  return null;
}

/** Kept for backward compatibility with the compressor and cropper, which accept any of the three formats. */
export function validateImageFile(file: File): string | null {
  return validateFile(file, ALL_IMAGE_TYPES);
}
