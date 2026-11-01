import fs from 'fs';
import sharp from 'sharp';

/**
 * Resizes an already-saved image file in place (caps dimensions, re-encodes at reduced
 * quality) and doubles as content validation: sharp only succeeds on bytes it can
 * actually decode as the claimed format, so a renamed non-image file (or a corrupt one)
 * throws here rather than silently passing an extension/mimetype-only check.
 *
 * Keeps the original format (jpeg/png/webp) rather than forcing webp conversion, so
 * every existing consumer of a stored image URL keeps working against the same
 * extension it uploaded with.
 *
 * @param {string} filePath - path to the file on disk, overwritten with the processed result
 * @param {string} mimetype - the multer-reported mimetype, used to pick jpeg/png/webp encoding
 * @param {{ maxDimension?: number, quality?: number }} [options]
 */
export async function optimizeImageInPlace(filePath, mimetype, options = {}) {
  // 2400px covers full-bleed hero banners at typical/retina viewport widths without
  // visible softening; still a real cap against an unedited 6000px+ DSLR/phone photo.
  const { maxDimension = 2400, quality = 80 } = options;

  const image = sharp(filePath, { failOn: 'error' });
  // Throws (propagates to the caller) if the file isn't a decodable image at all,
  // e.g. a non-image renamed to a .jpg extension.
  await image.metadata();

  const resized = image
    // Phone camera photos are very commonly stored upright-pixels + an EXIF orientation
    // tag saying "actually rotate me". sharp strips EXIF on output by default (nothing
    // else here calls .withMetadata()), which would silently discard that tag and leave
    // the photo sideways/upside-down. .rotate() with no args bakes the EXIF orientation
    // into the actual pixels first, so the output is correctly oriented without it.
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    });

  let processed;
  if (mimetype === 'image/png') {
    // PNG's `quality` option enables lossy palette quantization, which can visibly
    // band gradients/transparency in logos or graphics — stay lossless and just turn up
    // the (lossless) compression effort instead. Resizing alone already does most of
    // the size reduction for oversized PNGs.
    processed = await resized.png({ compressionLevel: 9 }).toBuffer();
  } else if (mimetype === 'image/webp') {
    processed = await resized.webp({ quality }).toBuffer();
  } else {
    processed = await resized.jpeg({ quality }).toBuffer();
  }

  await fs.promises.writeFile(filePath, processed);
  return processed.length;
}

/** Image mimetypes safe to hand to sharp; GIF is deliberately excluded since re-encoding
 * would collapse an animated GIF to its first frame. */
export function isSharpProcessableImage(mimetype) {
  return mimetype === 'image/jpeg' || mimetype === 'image/png' || mimetype === 'image/webp';
}
