export interface ApiErrorDetail {
  msg: string
}

export interface ApiErrorResponse {
  detail?: string | ApiErrorDetail[]
}
