import { onSchedule } from 'firebase-functions/v2/scheduler'
import { schedulePublicOption } from '@/routings/options'
import {
  RewardDataResponse,
  getAllStakeRewardsByPubkey,
} from '@skeet-framework/solana-utils'
import { defineSecret } from 'firebase-functions/params'
import { sendDiscord } from '@skeet-framework/utils'

const DISCORD_WEBHOOK_URL = defineSecret('DISCORD_WEBHOOK_URL_STAKE')

export const stakeMonitor = onSchedule(
  { ...schedulePublicOption, secrets: [DISCORD_WEBHOOK_URL] },
  async (event) => {
    try {
      const walletPubkey = 'FeHuuomzfDz5x1XQXKiSdqMqggeFYyA1aJVULZp92bhD'
      const result: RewardDataResponse = await getAllStakeRewardsByPubkey(
        'https://api.mainnet-beta.solana.com',
        walletPubkey
      )
      const content = `Account: ${walletPubkey}
Epoch: ${result.epoch}
Reward: ${result.totalRewardAmount} SOL
Total SOL: ${result.totalBalance} SOL
`
      await sendDiscord(content, {
        webhookUrl: DISCORD_WEBHOOK_URL.value(),
        username: 'Skeet Staking Monitor',
      })
      console.log({ status: 'success' })
    } catch (error) {
      console.log({ status: 'error', message: String(error) })
    }
  }
)