import { push } from 'notivue'

export const useNotifications = () => {
  return {
    success: (message: string) => push.success({
      title: 'Success',
      message
    }),
    error: (message: string) => push.error({
      title: 'Error',
      message
    }),
    warning: (message: string) => push.warning({
      title: 'Warning',
      message
    }),
    info: (message: string) => push.info({
      title: 'Info',
      message
    }),
  }
}
