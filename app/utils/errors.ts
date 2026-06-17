export function parseApiError(err: any) {
  const statusCode = Number(err?.statusCode || err?.status || err?.data?.statusCode || 0)
  const message = err?.data?.data?.message || err?.data?.message || err?.data?.statusMessage || err?.statusMessage || err?.message || 'An error occurred'
  const errors = err?.data?.data?.errors || err?.data?.errors || null

  return {
    statusCode,
    message,
    errors,
  }
}
