import { createNotivue } from 'notivue'
import 'notivue/notification.css'
import 'notivue/animations.css'

export default defineNuxtPlugin((nuxtApp) => {
  const notivue = createNotivue({
    position: 'top-right',
    limit: 5,
    enqueue: true,
    avoidDuplicates: true,
    transition: 'notivue-bounce',
  })
  
  nuxtApp.vueApp.use(notivue)
})
