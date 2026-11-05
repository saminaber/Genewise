import { MAX_FILE_BYTES } from './parser.js';

const archiveMessage = 'Extract the compressed archive first, then choose the TXT or CSV file inside.';

// Inspect original bytes before UTF-8 decoding can replace an archive signature.
export function decodeDNABytes(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength === 0) throw new Error('This file is empty. Choose a raw SNP text export.');
  if (bytes.byteLength > MAX_FILE_BYTES) throw new Error('File too large. Choose an uncompressed text file under 20 MB.');
  const zip = bytes[0] === 0x50 && bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
     (bytes[2] === 0x05 && bytes[3] === 0x06) ||
     (bytes[2] === 0x07 && bytes[3] === 0x08));
  const gzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (zip || gzip) throw new Error(archiveMessage);
  if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)) {
    throw new Error('UTF-16 files are not supported. Export this file as UTF-8 text first.');
  }
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error('This file is not valid UTF-8 text. Choose an uncompressed raw SNP TXT or CSV export.'); }
  if (text.includes('\u0000')) throw new Error('This file contains binary data. Choose an uncompressed UTF-8 SNP text export.');
  return text;
}
