// export function getAccessToken(): string | null {
//   if (typeof document === 'undefined') return null
//   const match = document.cookie.match(/access_token=([^;]+)/)
//   return match ? decodeURIComponent(match[1]) : null
// }

// export interface Submission {
//   submission_id: number
//   student_id: string | null
//   validation_status: string
//   total_score: number | null
//   max_score: number | null
//   is_finalized: boolean
//   message?: string
// }

// export interface UploadResponse {
//   submission_id?: number
//   Assignment_id?: number
//   validation_status: string
//   status?: string
// }

// export interface GradingQuestion {
//   canonical_question_id: string
//   display_label: string
//   max_marks: number
//   final_score: number | null
//   status?: string
//   needs_review?: boolean
//   evaluations?: Array<{
//     llm: string
//     model: string
//     score: number
//     rationale: string
//   }>
// }

// export interface GradingJSON {
//   submission_id: number
//   paper_id: string
//   student_id: string
//   question_results: Record<string, GradingQuestion>
//   summary?: {
//     totals: {
//       awarded_score: number
//       total_score: number
//       max_score: number
//     }
//   }
// }

// export interface ReviewOverride {
//   canonical_question_id: string
//   override_score: number
//   reason: string
//   feedback?: string
// }

// export async function listSubmissions(paperId: number): Promise<Submission[]> {
//   const res = await fetch(`/api/ag/list?paperId=${paperId}`)
//   if (!res.ok) throw new Error(`List failed: ${res.status}`)
//   return res.json()
// }

// export async function uploadAndGrade(paperId: number, file: File): Promise<UploadResponse> {
//   const formData = new FormData()
//   formData.append('file', file)
//   formData.append('paperId', String(paperId))
//   formData.append('exam_id', '1')

//   const res = await fetch('/api/ag/upload', {
//     method: 'POST',
//     body: formData,
//   })
//   if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
//   return res.json()
// }

// export async function getSubmissionStatus(submissionId: number): Promise<Submission> {
//   const res = await fetch(`/api/ag/status?submissionId=${submissionId}`)
//   if (!res.ok) throw new Error(`Status failed: ${res.status}`)
//   return res.json()
// }

// export async function getGradingJSON(submissionId: number): Promise<GradingJSON> {
//   const res = await fetch(`/api/ag/grading-json?submissionId=${submissionId}`)
//   if (!res.ok) throw new Error(`Grading JSON failed: ${res.status}`)
//   return res.json()
// }

// export async function applyReview(
//   paperId: number,
//   submissionId: number,
//   overrides: ReviewOverride[]
// ): Promise<void> {
//   const res = await fetch('/api/ag/review', {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ paperId, submissionId, overrides }),
//   })
//   if (!res.ok) throw new Error(`Review failed: ${res.status}`)
// }

// export async function finalizeSubmission(submissionId: number): Promise<void> {
//   const res = await fetch('/api/ag/finalize', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ submissionId }),
//   })
//   if (!res.ok) throw new Error(`Finalize failed: ${res.status}`)
// }

// export type NormalizedStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FINALIZED' | 'FAILED'

// export function normalizeStatus(raw?: string | null): NormalizedStatus {
//   if (!raw) return 'PENDING'
//   const s = raw.toUpperCase()
//   if (['SUCCESS', 'COMPLETED', 'COMPLETE', 'DONE', 'READY'].includes(s)) return 'SUCCESS'
//   if (['FAILED', 'ERROR', 'FAILURE'].includes(s)) return 'FAILED'
//   if (['RUNNING', 'PROCESSING', 'IN_PROGRESS', 'QUEUED', 'STARTED'].includes(s)) return 'RUNNING'
//   if (s === 'FINALIZED') return 'FINALIZED'
//   return 'PENDING'
// }

// export function isTerminalStatus(status: NormalizedStatus): boolean {
//   return ['SUCCESS', 'FINALIZED', 'FAILED'].includes(status)
// }

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/access_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export interface Submission {
  submission_id: number
  student_id: string | null
  validation_status: string
  total_score: number | null
  max_score: number | null
  is_finalized: boolean
  message?: string
}

export interface UploadResponse {
  submission_id?: number
  Assignment_id?: number
  validation_status: string
  status?: string
}

export interface GradingQuestion {
  canonical_question_id: string
  display_label: string
  max_marks: number
  final_score: number | null
  status?: string
  needs_review?: boolean
  evaluations?: Array<{
    llm: string
    model: string
    score: number
    rationale: string
  }>
}

export interface GradingJSON {
  submission_id: number
  paper_id: string
  student_id: string
  question_results: Record<string, GradingQuestion>
  summary?: {
    totals: {
      awarded_score: number
      total_score: number
      max_score: number
    }
  }
}

export interface ReviewOverride {
  canonical_question_id: string
  override_score: number
  reason: string
  feedback?: string
}

export async function listSubmissions(paperId: number): Promise<Submission[]> {
  const res = await fetch(`/api/ag/list?paperId=${paperId}`)
  if (!res.ok) throw new Error(`List failed: ${res.status}`)
  return res.json()
}

export async function uploadAndGrade(paperId: number, file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('paperId', String(paperId))
  formData.append('exam_id', '1')
  const res = await fetch('/api/ag/upload', { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export async function getSubmissionStatus(submissionId: number): Promise<Submission> {
  const res = await fetch(`/api/ag/status?submissionId=${submissionId}`)
  if (!res.ok) throw new Error(`Status failed: ${res.status}`)
  return res.json()
}

export async function getGradingJSON(submissionId: number): Promise<GradingJSON> {
  const res = await fetch(`/api/ag/grading-json?submissionId=${submissionId}`)
  if (!res.ok) throw new Error(`Grading JSON failed: ${res.status}`)
  return res.json()
}

export async function applyReview(
  paperId: number,
  submissionId: number,
  overrides: ReviewOverride[]
): Promise<void> {
  const res = await fetch('/api/ag/review', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperId, submissionId, overrides }),
  })
  if (!res.ok) throw new Error(`Review failed: ${res.status}`)
}

export async function finalizeSubmission(submissionId: number): Promise<void> {
  const res = await fetch('/api/ag/finalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId }),
  })
  if (!res.ok) throw new Error(`Finalize failed: ${res.status}`)
}

export async function deleteSubmission(submissionId: number): Promise<void> {
  const res = await fetch(`/api/ag/delete?submissionId=${submissionId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}

export async function updateSubmissionMeta(
  paperId: number,
  submissionId: number,
  studentId: string
): Promise<void> {
  const res = await fetch('/api/ag/meta', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperId, submissionId, student_id: studentId }),
  })
  if (!res.ok) throw new Error(`Meta update failed: ${res.status}`)
}

export type NormalizedStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FINALIZED' | 'FAILED'

export function normalizeStatus(raw?: string | null): NormalizedStatus {
  if (!raw) return 'PENDING'
  const s = raw.toUpperCase()
  if (['SUCCESS', 'COMPLETED', 'COMPLETE', 'DONE', 'READY'].includes(s)) return 'SUCCESS'
  if (['FAILED', 'ERROR', 'FAILURE'].includes(s)) return 'FAILED'
  if (['RUNNING', 'PROCESSING', 'IN_PROGRESS', 'QUEUED', 'STARTED'].includes(s)) return 'RUNNING'
  if (s === 'FINALIZED') return 'FINALIZED'
  return 'PENDING'
}

export function isTerminalStatus(status: NormalizedStatus): boolean {
  return ['SUCCESS', 'FINALIZED', 'FAILED'].includes(status)
}