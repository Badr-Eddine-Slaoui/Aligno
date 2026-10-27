import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => {
  if (event.method === 'GET') return walletController.getTransactions(event)
  if (event.method === 'POST') return walletController.createTransaction(event)
})
