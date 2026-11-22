import { Agent } from '@openai/agents'
import { buildAdminInstructions } from '@/lib/shopAssistant/instructions'
import { getShopAssistantModel } from '@/lib/shopAssistant/model'
import {
  addPrivateNoteTool,
  getInquiryTool,
  listOpenInquiriesTool,
  recordAssessmentTool,
} from '@/lib/shopAssistant/tools/adminTools'

export const createAdminAgent = () => {
  return new Agent({
    name: 'Boiko shop copilot',
    instructions: buildAdminInstructions(),
    model: getShopAssistantModel(),
    tools: [getInquiryTool, listOpenInquiriesTool, addPrivateNoteTool, recordAssessmentTool],
  })
}
