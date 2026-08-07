import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Max edge length sent to Vision — keeps payload small without killing OCR. */
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.7;

export type PreparedReceiptImage = {
  /** Local URI of the compressed image (for attachment / upload). */
  uri: string;
  /** Base64 JPEG content for Vision `image.content` (no data-URI prefix). */
  base64: string;
};

/**
 * Resize and JPEG-compress a receipt photo before OCR / upload.
 */
export async function prepareReceiptImage(uri: string): Promise<PreparedReceiptImage> {
  const context = ImageManipulator.manipulate(uri).resize({ width: MAX_EDGE_PX });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
    base64: true,
  });

  context.release();
  image.release();

  if (!result.base64) {
    throw new Error('Failed to encode receipt image for OCR.');
  }

  return { uri: result.uri, base64: result.base64 };
}
