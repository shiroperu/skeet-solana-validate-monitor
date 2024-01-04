import { onSchedule } from 'firebase-functions/v2/scheduler'
import { scheduleDefaultOption } from '@/routings/options'
import { defineSecret } from 'firebase-functions/params'
import {
  ValidatorStatusParams,
  isValidatorActive,
} from '@skeet-framework/solana-utils'
import { sendDiscord } from '@skeet-framework/utils'

const DISCORD_WEBHOOK_URL = defineSecret('DISCORD_WEBHOOK_URL')

export const solvMonitor = onSchedule(
  { ...scheduleDefaultOption, secrets: [DISCORD_WEBHOOK_URL] },
  async (event) => {
    try {
      const endpoint = 'https://api.testnet.solana.com'
      const voteAccountPubkey = 'GLCcq3vN9SgAj6iD5hL2eiKnU7oJm5zQAriiL7drg57S'
      const result: ValidatorStatusParams = await isValidatorActive(
        endpoint,
        voteAccountPubkey,
      )
      const content = `Validator: ${voteAccountPubkey}\nStatus: ${
        result.isActive ? 'active' : 'inactive'
      }\nMessage: ${result.reason}`
      await sendDiscord(content, {
        webhookUrl: DISCORD_WEBHOOK_URL.value(),
        username: 'Skeet Solana Monitor',
      })
      console.log({ result })
      console.log({ status: 'success' })
    } catch (error) {
      console.log({ status: 'error', message: String(error) })
    }
  },
)