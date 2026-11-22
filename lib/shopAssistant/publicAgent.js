import { Agent } from '@openai/agents'
import { buildPublicInstructions } from '@/lib/shopAssistant/instructions'
import { getShopAssistantModel } from '@/lib/shopAssistant/model'
import { submitShopInquiryTool } from '@/lib/shopAssistant/tools/submitShopInquiry'

export const createPublicAgent = () => {
  return new Agent({
    name: 'Boiko public shop assistant',
    instructions: buildPublicInstructions(),
    model: getShopAssistantModel(),
    tools: [submitShopInquiryTool],
  })
}
