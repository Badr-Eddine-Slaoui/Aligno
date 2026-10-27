interface SuccessEnvelope<T> {
  success: true
  data: T
}

interface ErrorEnvelope {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export function successResponse<T>(data: T, statusCode = 200) {
  return {
    statusCode,
    body: { success: true, data } as SuccessEnvelope<T>,
  }
}

export function throwApiError(
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>,
) {
  throw createError({
    statusCode,
    statusMessage: message,
    data: { success: false, message, errors } as ErrorEnvelope,
  })
}
