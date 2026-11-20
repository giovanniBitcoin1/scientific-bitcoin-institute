// Width and height of a PNG, JPEG or WebP file, read from its header.
// No dependency: only the few bytes that carry the dimensions are parsed.
import { readFileSync } from 'node:fs'

export function imageSizeOf(buf) {
  // PNG: 8-byte signature, then the IHDR chunk.
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) {
    if (buf.toString('latin1', 12, 16) !== 'IHDR') return null
    return { type: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  // JPEG: walk the segments up to the first start-of-frame marker.
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null
      const marker = buf[i + 1]
      if (marker === 0xff) {
        i += 1
        continue
      }
      // Markers without a length field.
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2
        continue
      }
      const length = buf.readUInt16BE(i + 2)
      const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      if (isFrame) return { type: 'jpeg', height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      if (length < 2) return null
      i += 2 + length
    }
    return null
  }
  // WebP: RIFF container with a VP8, VP8L or VP8X chunk.
  if (buf.length >= 30 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
    const chunk = buf.toString('latin1', 12, 16)
    if (chunk === 'VP8X') {
      return { type: 'webp', width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
    }
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21)
      return { type: 'webp', width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }
    }
    if (chunk === 'VP8 ') {
      return { type: 'webp', width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
    }
  }
  return null
}

// null when the file is not an image this reader understands.
export function imageSize(file) {
  return imageSizeOf(readFileSync(file))
}
