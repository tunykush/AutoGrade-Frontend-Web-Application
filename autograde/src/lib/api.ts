import type { ApiErrorDetail, ApiErrorResponse } from '@/types'

export function parseApiError(status: number, text: string): string {
  try {
    const data: ApiErrorResponse = JSON.parse(text)
    const detail = data?.detail
    if (Array.isArray(detail)) {
      return detail.map((d: ApiErrorDetail) => d.msg).join(', ')
    }
    return detail || `Error ${status}`
  } catch {
    return `Error ${status}: ${text || 'Something went wrong.'}`
  }
}
