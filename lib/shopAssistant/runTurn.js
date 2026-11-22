import { Runner } from '@openai/agents'
import { after } from 'next/server'
import { createAiSdkUiMessageStreamResponse } from '@openai/agents-extensions/ai-sdk-ui'
import { appendTranscriptMessage } from '@/lib/services/shopAssistantTranscriptService'
import { buildAgentInput, readFinalAssistantText } from '@/lib/shopAssistant/history'

export const streamShopAssistantTurn = ({
  agent,
  transcript,
  preamble,
  workflowName,
  imageInputs,
}) => {
  const transcriptId = transcript._id.toString()
  const runner = new Runner({
    workflowName,
    groupId: `shop-assistant-${transcriptId}`,
  })
  const input = buildAgentInput(transcript.messages, preamble, imageInputs)
  let inquiryId = ''

  if (transcript.inquiryId) {
    inquiryId = transcript.inquiryId.toString()
  }

  const streamedResultPromise = runner.run(agent, input, {
    stream: true,
    maxTurns: 8,
    context: {
      transcriptId,
      inquiryId,
    },
  })

  return streamedResultPromise.then((streamedResult) => {
    after(async () => {
      try {
        await streamedResult.completed
        const assistantText = readFinalAssistantText(streamedResult)

        if (!assistantText) {
          return
        }

        await appendTranscriptMessage(transcriptId, 'assistant', assistantText)
      } catch (error) {
        console.error('Shop assistant turn failed to save.', error)
      }
    })

    return createAiSdkUiMessageStreamResponse(streamedResult)
  })
}

export const rememberUserMessage = async (transcript, userText) => {
  return appendTranscriptMessage(transcript._id, 'user', userText)
}
