import fs from 'fs';

/**
 * Magic-byte signatures for the non-image types media.routes.js accepts (images are
 * validated by actually decoding them with sharp instead — see image-processing.js).
 * Extension + declared mimetype are trivially spoofable (rename anything.exe to
 * anything.pdf); this reads the real file header and checks it matches what the
 * extension claims.
 */
const SIGNATURES = {
  gif: [[0x47, 0x49, 0x46, 0x38]], // "GIF8" (covers both GIF87a and GIF89a)
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]], // "%PDF-"
  docx: [[0x50, 0x4b, 0x03, 0x04]], // docx/xlsx/pptx are all zip containers
  doc: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]], // legacy OLE compound file
};

async function readHeaderBytes(filePath, length) {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}

/**
 * @param {string} filePath
 * @param {string} ext - lowercase extension without the dot, e.g. 'pdf', 'mp4'
 * @returns {Promise<boolean>} true if the file's real header matches the extension, or
 * the extension isn't one this checker knows about (nothing to validate against).
 */
export async function fileHeaderMatchesExtension(filePath, ext) {
  const header = await readHeaderBytes(filePath, 12);

  // mp4/mov (ISO base media file format): a 4-byte box size followed by the ASCII box
  // type "ftyp" at offset 4. Both extensions share this container format.
  if (ext === 'mp4' || ext === 'mov') {
    return header.subarray(4, 8).toString('ascii') === 'ftyp';
  }

  const signatures = SIGNATURES[ext];
  if (!signatures) return true;
  return signatures.some((sig) => sig.every((byte, i) => header[i] === byte));
}
