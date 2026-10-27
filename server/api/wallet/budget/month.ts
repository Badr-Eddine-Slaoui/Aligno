import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => {
  if (event.method === 'GET') return walletController.getBudget(event)
  if (event.method === 'DELETE') return walletController.deleteBudget(event)
})
