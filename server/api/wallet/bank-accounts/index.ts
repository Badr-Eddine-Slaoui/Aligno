import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => {
  if (event.method === 'GET') return walletController.getBankAccounts(event)
  if (event.method === 'POST') return walletController.createBankAccount(event)
})
