import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => {
  if (event.method === 'GET') return walletController.getSubscriptions(event)
  if (event.method === 'POST') return walletController.createSubscription(event)
})
