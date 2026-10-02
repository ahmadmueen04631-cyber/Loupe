export type LoadedImage = { bitmap: ImageBitmap; width: number; height: number };

export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  return { bitmap, width: bitmap.width, height: bitmap.height };
}
