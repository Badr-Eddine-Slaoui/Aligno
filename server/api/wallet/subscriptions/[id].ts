import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => {
  if (event.method === 'GET') return walletController.getSubscription(event)
  if (event.method === 'PUT') return walletController.updateSubscription(event)
  if (event.method === 'DELETE') return walletController.deleteSubscription(event)
})
