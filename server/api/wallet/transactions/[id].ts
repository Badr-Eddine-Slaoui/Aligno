import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => {
  if (event.method === 'GET') return walletController.getTransaction(event)
  if (event.method === 'PUT') return walletController.updateTransaction(event)
  if (event.method === 'DELETE') return walletController.deleteTransaction(event)
})
