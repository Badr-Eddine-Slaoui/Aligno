import { walletController } from '../../../controller/wallet.controller'

export default defineEventHandler((event) => walletController.getMonthlyChart(event))
