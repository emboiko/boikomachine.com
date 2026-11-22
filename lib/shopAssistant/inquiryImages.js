import path from 'path'
import { get } from '@vercel/blob'

const VISION_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const MAX_VISION_IMAGES = 4
const MAX_VISION_BYTES = 4 * 1024 * 1024

export const isVisionImage = (attachment) => {
  const extension = path.extname(attachment.originalName || '').toLowerCase()
  const mimeType = attachment.mimeType || ''

  if (
    extension === '.heic' ||
    extension === '.heif' ||
    mimeType.includes('heic') ||
    mimeType.includes('heif')
  ) {
    return false
  }

  if (VISION_EXTENSIONS.has(extension)) {
    return true
  }

  return mimeType.startsWith('image/')
}

export const loadInquiryVisionInput = async (attachments) => {
  const images = []
  const skippedImageNames = []
  const otherFileNames = []

  for (const attachment of attachments || []) {
    if (!isVisionImage(attachment)) {
      otherFileNames.push(attachment.originalName)
      continue
    }

    if (images.length >= MAX_VISION_IMAGES || attachment.sizeBytes > MAX_VISION_BYTES) {
      skippedImageNames.push(attachment.originalName)
      continue
    }

    try {
      const result = await get(attachment.storageKey, { access: 'private' })

      if (!result || result.statusCode !== 200) {
        skippedImageNames.push(attachment.originalName)
        continue
      }

      const bytes = Buffer.from(await new Response(result.stream).arrayBuffer())
      const mimeType = attachment.mimeType || 'image/jpeg'

      images.push({
        name: attachment.originalName,
        dataUrl: `data:${mimeType};base64,${bytes.toString('base64')}`,
      })
    } catch {
      skippedImageNames.push(attachment.originalName)
    }
  }

  const noteParts = [
    'Photos attached to this inquiry are included below. Comment only on what is visible. Do not invent dimensions.',
    'Judge milling against a Series 1 2J Bridgeport and turning against a 13 inch Romi/DoAll lathe. Flag parts that look far too large for those machines, including anything that would not fit through a household doorway, and parts whose visible shape is mostly compound curves or other features a manual machine struggles to cut.',
    'Use scale only when something in the photo provides it, such as a hand, a bench, or a doorway. A Harig grinder and SMAW on thicker steel are available, but do not assume a photo shows a grinding or welding job.',
    'Do not measure STEP, DXF, SLA, or PDF files. Those stay on the inquiry for the owner to open.',
  ]

  if (otherFileNames.length > 0) {
    noteParts.push(`Files you cannot open: ${otherFileNames.join(', ')}.`)
  }

  if (skippedImageNames.length > 0) {
    noteParts.push(`Additional images are on the inquiry page: ${skippedImageNames.join(', ')}.`)
  }

  return {
    images,
    note: noteParts.join(' '),
    hasFiles: images.length > 0 || otherFileNames.length > 0 || skippedImageNames.length > 0,
  }
}
