import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => {
  if (event.method === 'GET') return walletController.getBankAccount(event)
  if (event.method === 'PUT') return walletController.updateBankAccount(event)
  if (event.method === 'DELETE') return walletController.deleteBankAccount(event)
})
