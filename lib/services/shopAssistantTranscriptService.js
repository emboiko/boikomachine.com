import { del } from '@vercel/blob'
import { connectToDatabase } from '@/lib/db/mongoose'
import { MAX_TOTAL_UPLOAD_BYTES } from '@/lib/constants'
import { ShopAssistantTranscript } from '@/lib/models/ShopAssistantTranscript'
import { uploadShopInquiryFile, validateUploadFile } from '@/lib/storage/blob'

const HOUR_MS = 60 * 60 * 1000

const serializeMessage = (message) => {
  return {
    id: message._id.toString(),
    role: message.role,
    text: message.text,
    createdAt: message.createdAt,
  }
}

export const getOrCreateTranscript = async ({ audience, sessionId, ipHash }) => {
  await connectToDatabase()
  const existingTranscript = await ShopAssistantTranscript.findOne({ audience, sessionId })

  if (existingTranscript) {
    if (ipHash && existingTranscript.ipHash !== ipHash) {
      existingTranscript.ipHash = ipHash
      await existingTranscript.save()
    }

    return existingTranscript
  }

  try {
    return await ShopAssistantTranscript.create({
      audience,
      sessionId,
      ipHash: ipHash || '',
      messages: [],
    })
  } catch (error) {
    if (error && error.code === 11000) {
      return ShopAssistantTranscript.findOne({ audience, sessionId })
    }

    throw error
  }
}

export const countRecentPublicUserMessages = async (ipHash) => {
  await connectToDatabase()
  const windowStart = new Date(Date.now() - HOUR_MS)
  const counts = await ShopAssistantTranscript.aggregate([
    { $match: { audience: 'public', ipHash } },
    { $unwind: '$messages' },
    {
      $match: {
        'messages.role': 'user',
        'messages.createdAt': { $gte: windowStart },
      },
    },
    { $count: 'total' },
  ])

  if (!counts[0]) {
    return 0
  }

  return counts[0].total
}

export const appendTranscriptMessage = async (transcriptId, role, text) => {
  await connectToDatabase()

  return ShopAssistantTranscript.findByIdAndUpdate(
    transcriptId,
    {
      $push: {
        messages: {
          role,
          text,
        },
      },
    },
    { returnDocument: 'after' },
  )
}

export const serializeTranscriptMessages = (transcript) => {
  if (!transcript) {
    return []
  }

  return transcript.messages.map(serializeMessage)
}

export const transcriptHasRoom = (transcript, maxMessages) => {
  return transcript.messages.length < maxMessages
}

export const serializePublicAttachments = (transcript) => {
  if (!transcript || !transcript.attachments) {
    return []
  }

  return transcript.attachments.map((attachment) => {
    return {
      id: attachment._id.toString(),
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
    }
  })
}

const createServiceError = (message, status = 400) => {
  const error = new Error(message)
  error.status = status
  return error
}

export const addPublicTranscriptAttachment = async (sessionId, file) => {
  const validation = validateUploadFile(file)

  if (!validation.valid) {
    throw createServiceError(validation.error)
  }

  const transcript = await getOrCreateTranscript({
    audience: 'public',
    sessionId,
    ipHash: '',
  })

  if (transcript.inquiryId) {
    throw createServiceError('This request was already sent.')
  }

  const currentAttachments = transcript.attachments || []
  const existingBytes = currentAttachments.reduce((total, attachment) => {
    return total + attachment.sizeBytes
  }, 0)

  if (existingBytes + file.size > MAX_TOTAL_UPLOAD_BYTES) {
    throw createServiceError('Total upload size exceeds the 25 MB limit.')
  }

  const uploaded = await uploadShopInquiryFile(file)
  transcript.attachments.push(uploaded)
  await transcript.save()

  return serializePublicAttachments(transcript)
}

export const removePublicTranscriptAttachment = async (sessionId, attachmentId) => {
  const transcript = await getOrCreateTranscript({
    audience: 'public',
    sessionId,
    ipHash: '',
  })

  if (transcript.inquiryId) {
    throw createServiceError('This request was already sent.')
  }

  const attachment = transcript.attachments.id(attachmentId)

  if (!attachment) {
    throw createServiceError('File not found.', 404)
  }

  const storageKey = attachment.storageKey
  attachment.deleteOne()
  await transcript.save()

  try {
    await del(storageKey)
  } catch {
    return serializePublicAttachments(transcript)
  }

  return serializePublicAttachments(transcript)
}
