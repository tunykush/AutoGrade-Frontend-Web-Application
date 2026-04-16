'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CriteriaLevel {
  range: string
  criteria: string[]
}

interface RubricEntry {
  criteria_levels: CriteriaLevel[]
  approved_by_user: boolean
}

interface RubricMap {
  [canonical_question_id: string]: RubricEntry
}

interface Question {
  canonical_question_id: string
  display_label: string
  question_text?: string
  question_content?: { text?: string }
  sample_answer?: string
  max_marks: number
  is_gradeable?: boolean
  parts?: Question[]
}

interface RubricStatus {
  paper_id: number
  rubric_status: string
  rubric_version: number
  rubric_round: number
  progress: { total: number; done: number; by_qnode: Record<string, unknown> }
  locked_at: string | null
  locked_by: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function questionText(q: Question): string {
  return q.question_content?.text ?? q.question_text ?? ''
}

function flattenQuestions(questions: Question[]): Question[] {
  const out: Question[] = []
  const walk = (qs: Question[]) => {
    for (const q of qs) {
      if (!q.canonical_question_id) continue
      if (q.parts?.length) {
        walk(q.parts)
      } else {
        out.push(q)
      }
    }
  }
  walk(questions)
  return out
}

function rubricFromByQnode(by_qnode: Record<string, unknown>): RubricMap {
  const map: RubricMap = {}
  for (const [cid, val] of Object.entries(by_qnode)) {
    const d = val as Record<string, unknown>
    if (d?.criteria_levels) {
      map[cid] = {
        criteria_levels: d.criteria_levels as CriteriaLevel[],
        approved_by_user: (d.approved_by_user as boolean) ?? false,
      }
    }
  }
  return map
}

const ACTIVE_STATUSES = new Set(['PENDING', 'GENERATING', 'IN_PROGRESS', 'RUNNING', 'QUEUED', 'READY'])
const TERMINAL_STATUSES = new Set(['FINALIZED', 'FAILED', 'TIMEOUT'])

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ onMyPapers }: { onMyPapers: () => void }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gray-900 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Edgen AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onMyPapers} className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
            My Papers
          </button>
          <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">A</div>
        </div>
      </div>
    </header>
  )
}

// ─── Setup modal ──────────────────────────────────────────────────────────────

function SetupModal({
  token,
  onPaperId,
  onLoad,
  onClose,
}: {
  token: string
  onPaperId: (v: string) => void
  onLoad: (pid: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'upload' | 'id'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [manualId, setManualId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const authHeader: Record<string, string> = token ? { 'X-Auth-Token': token } : {}

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setUploadError(null)
    setUploadStatus('Uploading…')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/paper/upload', {
        method: 'POST',
        headers: authHeader,
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.detail ?? data.error ?? data.message ?? `Error ${res.status}`)
        setUploadStatus(null)
        return
      }
      const pid = data.paper_id ?? data.id ?? data.exam_id
      if (!pid) {
        setUploadError('Upload succeeded but no paper ID returned')
        setUploadStatus(null)
        return
      }
      setUploadStatus('Processing…')
      let ready = false
      let interval = 12000
      const deadline = Date.now() + 5 * 60 * 1000
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, interval))
        const statusRes = await fetch(`/api/paper/${pid}/status`, { headers: authHeader })
        if (statusRes.status === 429) {
          interval = Math.min(interval * 2, 60000)
          setUploadStatus(`Rate limited — retrying in ${Math.round(interval / 1000)}s…`)
          continue
        }
        if (!statusRes.ok) continue
        interval = 12000
        const s = await statusRes.json()
        const vs: string = s.validation_status ?? s.status ?? s.paper_status ?? ''
        setUploadStatus(`Processing… (${vs || 'checking'})`)
        if (['SUCCESS', 'READY'].includes(vs)) { ready = true; break }
        if (['FAILED', 'ERROR'].includes(vs)) {
          setUploadError(`Paper processing failed: ${s.message ?? vs}`)
          setUploadStatus(null)
          return
        }
      }
      onPaperId(String(pid))
      setUploadStatus(ready ? `Ready — loading…` : `Timed out — loading anyway…`)
      onLoad(String(pid))
    } catch {
      setUploadError('Upload failed')
      setUploadStatus(null)
    } finally {
      setUploading(false)
    }
  }

  const handleLoadById = () => {
    const pid = manualId.trim()
    if (!pid) return
    onPaperId(pid)
    onLoad(pid)
  }

  const tabBtn = (t: 'upload' | 'id', label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
        tab === t ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Load a paper</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabBtn('upload', 'Upload PDF')}
          {tabBtn('id', 'Enter Paper ID')}
        </div>

        {tab === 'upload' && (
          <>
            <div
              className="rounded-lg border-2 border-dashed border-gray-200 px-4 py-10 text-center cursor-pointer hover:border-violet-400 transition-colors"
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-500">{file ? file.name : 'Click to select a PDF'}</p>
              <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            {uploadStatus && <p className="text-xs text-violet-600">{uploadStatus}</p>}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              {uploading ? uploadStatus ?? 'Uploading…' : 'Upload & load'}
            </button>
          </>
        )}

        {tab === 'id' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Paper ID</label>
              <input
                type="number"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoadById()}
                placeholder="e.g. 51"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={handleLoadById}
              disabled={!manualId.trim()}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              Load paper
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Criteria level editor ────────────────────────────────────────────────────

function CriteriaLevelEditor({ level, onChange, onRemove }: {
  level: CriteriaLevel
  onChange: (updated: CriteriaLevel) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-12 shrink-0">Range</span>
        <input
          className="flex-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={level.range}
          onChange={(e) => onChange({ ...level, range: e.target.value })}
          placeholder="e.g. 0–5"
        />
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors px-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-1.5 pl-14">
        {level.criteria.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={c}
              onChange={(e) => {
                const updated = [...level.criteria]
                updated[i] = e.target.value
                onChange({ ...level, criteria: updated })
              }}
              placeholder={`Criterion ${i + 1}`}
            />
            <button
              onClick={() => onChange({ ...level, criteria: level.criteria.filter((_, idx) => idx !== i) })}
              className="text-gray-300 hover:text-red-400 transition-colors px-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange({ ...level, criteria: [...level.criteria, ''] })}
          className="text-xs text-violet-600 hover:text-violet-700 font-medium"
        >
          + Add criterion
        </button>
      </div>
    </div>
  )
}

// ─── Question card (left column) ──────────────────────────────────────────────

function QuestionCard({
  question,
  rubric,
  isFinalized,
  isRubricGenerating,
  isSaving,
  onRubricChange,
}: {
  question: Question
  rubric: RubricEntry | undefined
  isFinalized: boolean
  isRubricGenerating: boolean
  isSaving: boolean
  onRubricChange: (cid: string, updated: RubricEntry) => void
}) {
  const [editing, setEditing] = useState(false)
  const empty: RubricEntry = { criteria_levels: [{ range: '', criteria: [''] }], approved_by_user: false }
  const [draft, setDraft] = useState<RubricEntry>(rubric ?? empty)

  useEffect(() => { if (rubric) setDraft(rubric) }, [rubric])

  const handleSave = () => {
    onRubricChange(question.canonical_question_id, draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(rubric ?? empty)
    setEditing(false)
  }

  const toggleApprove = () => {
    if (!rubric) return
    onRubricChange(question.canonical_question_id, { ...rubric, approved_by_user: !rubric.approved_by_user })
  }

  const approved = rubric?.approved_by_user ?? false
  const hasRubric = rubric && rubric.criteria_levels.some(l => l.range || l.criteria.some(Boolean))
  const sampleAnswer = question.sample_answer ?? question.question_content?.text ?? null

  // Band colours cycle through a set based on index (top score = green, descending)
  const bandColours = [
    'border-green-200 bg-green-50',
    'border-yellow-200 bg-yellow-50',
    'border-orange-200 bg-orange-50',
    'border-red-200 bg-red-50',
  ]

  return (
    <div className="px-5 py-4 border-b border-gray-100 last:border-0">
      {/* Question row */}
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 shrink-0 mt-0.5 min-w-[2rem] text-center">
          {question.display_label}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-gray-800 leading-relaxed">
              {questionText(question) ? questionText(question) : <span className="italic text-gray-400">No question text</span>}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-gray-500">{question.max_marks} marks</span>
              {/* Per-question rubric status dot */}
              {isRubricGenerating && !rubric ? (
                <span title="Generating…" className="w-2 h-2 rounded-full bg-orange-300 animate-pulse shrink-0" />
              ) : rubric && !approved ? (
                <span title="Rubric ready" className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              ) : approved ? (
                <span title="Approved" className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              ) : null}
            </div>
          </div>

          {/* Sub-parts */}
          {question.parts && question.parts.length > 0 && (
            <div className="mt-3 space-y-2 pl-2 border-l-2 border-gray-100">
              {question.parts.map(part => (
                <div key={part.canonical_question_id} className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500 shrink-0 mt-0.5">
                    {part.display_label}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{questionText(part)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sample answer */}
          {sampleAnswer && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Sample Answer</p>
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
                <p className="text-sm text-gray-700 leading-relaxed">{sampleAnswer}</p>
              </div>
            </div>
          )}

          {/* Rubric — always visible once data exists */}
          {(hasRubric || editing) && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Rubric</p>
                {!isFinalized && !editing && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleApprove}
                      disabled={isSaving}
                      className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-40 ${
                        approved
                          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {approved ? '✓ Approved' : 'Approve'}
                    </button>
                    <button
                      onClick={() => { setDraft(rubric ?? empty); setEditing(true) }}
                      className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-2">
                  {draft.criteria_levels.map((level, i) => (
                    <CriteriaLevelEditor
                      key={i}
                      level={level}
                      onChange={(updated) =>
                        setDraft((prev) => {
                          const levels = [...prev.criteria_levels]
                          levels[i] = updated
                          return { ...prev, criteria_levels: levels }
                        })
                      }
                      onRemove={() =>
                        setDraft((prev) => ({
                          ...prev,
                          criteria_levels: prev.criteria_levels.filter((_, idx) => idx !== i),
                        }))
                      }
                    />
                  ))}
                  <button
                    onClick={() => setDraft((prev) => ({ ...prev, criteria_levels: [...prev.criteria_levels, { range: '', criteria: [''] }] }))}
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                  >
                    + Add score band
                  </button>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={handleCancel} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                      {isSaving ? 'Saving…' : 'Save criteria'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(rubric ?? empty).criteria_levels.map((level, i) => (
                    <div key={i} className={`rounded-lg border px-3 py-2.5 ${bandColours[i % bandColours.length]}`}>
                      {level.range && (
                        <p className="text-[11px] font-semibold text-gray-600 mb-1.5">
                          {level.range}
                        </p>
                      )}
                      <ul className="space-y-1">
                        {level.criteria.filter(Boolean).map((c, j) => (
                          <li key={j} className="flex gap-2 text-xs text-gray-700">
                          <span className="text-gray-300 shrink-0">•</span>
                          {c}
                        </li>
                      ))}
                          </ul>
                        </div>
                      ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Rubric status badge ───────────────────────────────────────────────────────

function RubricStatusBadge({ status, isGenerating }: { status: string | null; isGenerating: boolean }) {
  if (!status) return null

  if (status === 'FINALIZED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        Finalized
      </span>
    )
  }

  if (isGenerating || ['GENERATING', 'IN_PROGRESS', 'RUNNING'].includes(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-medium text-orange-600">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Checking
      </span>
    )
  }

  if (['PENDING', 'QUEUED'].includes(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-orange-300 px-2.5 py-0.5 text-xs font-medium text-orange-500">
        Pending
      </span>
    )
  }

  if (['FAILED', 'TIMEOUT'].includes(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-600">
        Failed
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
      {status}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RubricTestPage() {
  const [showSetup, setShowSetup] = useState(true)
  const [paperId, setPaperId] = useState('')
  const [paperFileName, setPaperFileName] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    fetch('/api/debug/token').then(r => r.ok ? r.json() : null).then(d => { if (d?.token) setToken(d.token) })
  }, [])

  const [questions, setQuestions] = useState<Question[]>([])
  const [questionTree, setQuestionTree] = useState<Question[]>([])
  const [rubrics, setRubrics] = useState<RubricMap>({})
  const [rubricStatus, setRubricStatus] = useState<RubricStatus | null>(null)
  const [examMeta, setExamMeta] = useState<{ name: string; code: string; total_marks: number } | null>(null)

  const [paperStatus, setPaperStatus] = useState<Record<string, unknown> | null>(null)
  const [debugMasterJson, setDebugMasterJson] = useState<unknown>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingCid, setSavingCid] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [sampleAnswerFile, setSampleAnswerFile] = useState<File | null>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const paperPollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const authHeaders: Record<string, string> = token ? { 'X-Auth-Token': token } : {}

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchStatus = useCallback(async (pid: string): Promise<RubricStatus | null> => {
    const res = await fetch(`/api/rubric/${pid}/status`, { headers: authHeaders })
    if (!res.ok) return null
    return res.json()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const startPolling = useCallback((pid: string) => {
    if (pollRef.current) clearTimeout(pollRef.current)
    const poll = async (interval = 10000) => {
      const s = await fetchStatus(pid)
      if (!s) return
      setRubricStatus(s)
      if (s.progress?.by_qnode && Object.keys(s.progress.by_qnode).length > 0) {
        setRubrics(rubricFromByQnode(s.progress.by_qnode))
      }
      const allDone = s.progress?.total > 0 && s.progress.done >= s.progress.total
      if (ACTIVE_STATUSES.has(s.rubric_status) && !allDone) {
        pollRef.current = setTimeout(() => poll(interval), interval)
      }
    }
    poll()
  }, [fetchStatus])

  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current)
    if (paperPollRef.current) clearTimeout(paperPollRef.current)
  }, [])

  const startPaperStatusPolling = useCallback((pid: string) => {
    if (paperPollRef.current) clearTimeout(paperPollRef.current)
    const poll = async (interval = 10000) => {
      const res = await fetch(`/api/paper/${pid}/status`, { headers: authHeaders })
      if (res.status === 429) {
        paperPollRef.current = setTimeout(() => poll(Math.min(interval * 2, 60000)), interval * 2)
        return
      }
      if (!res.ok) return
      const s = await res.json()
      setPaperStatus(s)
      const st: string = s.validation_status ?? s.status ?? s.paper_status ?? ''
      if (st && !['SUCCESS', 'READY', 'FINALIZED', 'FAILED', 'ERROR'].includes(st)) {
        paperPollRef.current = setTimeout(() => poll(interval), interval)
      }
    }
    poll()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRubricPhase = useCallback((pid: string, status: RubricStatus) => {
    setRubricStatus(status)
    if (status.progress?.by_qnode && Object.keys(status.progress.by_qnode).length > 0) {
      setRubrics(rubricFromByQnode(status.progress.by_qnode))
    }
    if (ACTIVE_STATUSES.has(status.rubric_status)) {
      startPolling(pid)
    } else if (!TERMINAL_STATUSES.has(status.rubric_status)) {
      fetch(`/api/rubric/${pid}/create`, { method: 'POST', headers: authHeaders })
        .then(async (r) => {
          if (!r.ok) {
            const d = await r.json().catch(() => ({}))
            showToast(d.detail ?? d.error ?? d.message ?? `Rubric create failed (${r.status})`, 'error')
          }
          startPolling(pid)
        })
        .catch(() => showToast('Rubric create request failed', 'error'))
    }
    startPaperStatusPolling(pid)
  }, [startPolling, startPaperStatusPolling, token]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPaper = useCallback(async (pidOverride?: string) => {
    const pid = pidOverride ?? paperId
    if (!pid.trim()) return
    setLoading(true)
    setLoadError(null)
    setShowSetup(false)

    const fetchWithRetry = async (url: string, opts: RequestInit, maxWaitMs = 120000): Promise<Response> => {
      let wait = 5000
      const deadline = Date.now() + maxWaitMs
      while (true) {
        const res = await fetch(url, opts)
        if (res.status !== 429 || Date.now() + wait > deadline) return res
        await new Promise(r => setTimeout(r, wait))
        wait = Math.min(wait * 2, 30000)
      }
    }

    try {
      const paperStatusRes = await fetchWithRetry(`/api/paper/${pid}/status`, { headers: authHeaders })
      if (!paperStatusRes.ok) {
        const err = await paperStatusRes.json().catch(() => ({}))
        setLoadError(err.detail ?? err.error ?? `Error ${paperStatusRes.status}`)
        setLoading(false)
        return
      }
      const paperSt = await paperStatusRes.json()
      setPaperStatus(paperSt)
      if (paperSt.filename ?? paperSt.file_name ?? paperSt.name) {
        setPaperFileName(paperSt.filename ?? paperSt.file_name ?? paperSt.name)
      }

      const masterRes = await fetchWithRetry(`/api/paper/${pid}/master-json`, { headers: authHeaders })
      const masterData = await masterRes.json().catch(() => null)
      setDebugMasterJson({ status: masterRes.status, body: masterData })
      if (!masterRes.ok || !masterData) {
        setLoadError(`Failed to load questions (HTTP ${masterRes.status}): ${masterData?.detail ?? masterData?.error ?? masterData?.message ?? 'no body'}`)
        setLoading(false)
        return
      }
      const rawQuestions: Question[] = masterData.questions ?? masterData.data?.questions ?? masterData.items ?? []
      setQuestionTree(rawQuestions)
      setQuestions(flattenQuestions(rawQuestions))
      if (masterData.exam_meta) setExamMeta(masterData.exam_meta)

      // If already finalized, load rubric status immediately
      if (paperSt.is_finalized) {
        const rubricStatusRes = await fetch(`/api/rubric/${pid}/status`, { headers: authHeaders })
        if (rubricStatusRes.ok) {
          const rs: RubricStatus = await rubricStatusRes.json()
          startRubricPhase(pid, rs)
        }
      }
    } catch {
      setLoadError('Network error — check the dev server is running')
    } finally {
      setLoading(false)
    }
  }, [paperId, token]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinalizeQuestions = useCallback(async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/paper/${paperId}/finalize`, { method: 'POST', headers: authHeaders })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast(data.detail ?? data.error ?? `Error ${res.status}`, 'error')
        return
      }
      const rubricStatusRes = await fetch(`/api/rubric/${paperId}/status`, { headers: authHeaders })
      if (rubricStatusRes.ok) {
        const rs: RubricStatus = await rubricStatusRes.json()
        startRubricPhase(paperId, rs)
      } else {
        fetch(`/api/rubric/${paperId}/create`, { method: 'POST', headers: authHeaders })
          .then(() => startPolling(paperId))
          .catch(() => null)
      }
      showToast('Questions finalised — generating rubric')
    } catch {
      showToast('Request failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }, [paperId, token]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/rubric/${paperId}/create`, { method: 'POST', headers: authHeaders })
      const data = await res.json()
      if (res.ok) {
        showToast('Rubric generation started')
        startPolling(paperId)
      } else {
        showToast(data.detail ?? data.error ?? `Error ${res.status}`, 'error')
      }
    } catch {
      showToast('Request failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRubricChange = async (cid: string, updated: RubricEntry) => {
    setRubrics((prev) => ({ ...prev, [cid]: updated }))
    if (!rubricStatus) return
    setSavingCid(cid)
    try {
      const res = await fetch(`/api/rubric/${paperId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ rubrics: { [cid]: updated }, expected_rubric_version: rubricStatus.rubric_version }),
      })
      const data = await res.json()
      if (res.ok) {
        setRubricStatus((prev) => prev ? { ...prev, rubric_version: data.rubric_version ?? prev.rubric_version } : prev)
        showToast(`Saved criteria for ${cid}`)
      } else {
        showToast(data.detail ?? data.error ?? 'Save failed', 'error')
      }
    } catch {
      showToast('Save failed', 'error')
    } finally {
      setSavingCid(null)
    }
  }

  const handleFinalizeRubric = async () => {
    if (!rubricStatus) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/rubric/${paperId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ expected_rubric_version: rubricStatus.rubric_version }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Rubric finalized')
        const s = await fetchStatus(paperId)
        if (s) setRubricStatus(s)
      } else {
        showToast(data.detail ?? data.error ?? `Error ${res.status}`, 'error')
      }
    } catch {
      showToast('Finalize failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const status = rubricStatus?.rubric_status ?? null
  const isFinalized = status === 'FINALIZED'
  const allRubricsDone = (rubricStatus?.progress?.total ?? 0) > 0 && (rubricStatus?.progress?.done ?? 0) >= (rubricStatus?.progress?.total ?? 1)
  const isGenerating = status ? (ACTIVE_STATUSES.has(status) && !allRubricsDone) : false
  const isQuestionsFinalized = !!(paperStatus as Record<string, unknown> | null)?.is_finalized
  const totalMarks = examMeta?.total_marks ?? questions.reduce((s, q) => s + (q.max_marks ?? 0), 0)
  const approvedCount = questions.filter((q) => rubrics[q.canonical_question_id]?.approved_by_user).length

  // Display questions: prefer tree for hierarchy, fall back to flat
  const displayQuestions = questionTree.length > 0 ? questionTree : questions

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      <Nav onMyPapers={() => setShowSetup(true)} />

      {showSetup && (
        <SetupModal
          token={token}
          onPaperId={setPaperId}
          onLoad={loadPaper}
          onClose={() => { if (paperId) setShowSetup(false) }}
        />
      )}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {!showSetup && (
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                <button onClick={() => setShowSetup(true)} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Papers
                </button>
                <span className="text-gray-300">/</span>
                <span>{paperFileName || (paperId ? `paper_${paperId}.pdf` : 'paper')}</span>
                <span className="text-gray-300">/</span>
                <span className="font-semibold text-gray-900">Setup</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">Paper Setup</h1>
              <p className="text-sm text-gray-500 mt-1">Configure rubric and sample answer before grading</p>
            </div>
            {/* Paper Ready badge */}
            {!loading && !loadError && questions.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Paper Ready
              </div>
            )}
          </div>

          {/* Load error */}
          {loadError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-700 mb-5">{loadError}</div>
          )}
          {!!debugMasterJson && !!loadError && (
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-5 py-3 text-xs font-mono text-yellow-900 whitespace-pre-wrap break-all mb-5">
              <p className="font-bold mb-1 text-yellow-700">Debug — master-json response:</p>
              {JSON.stringify(debugMasterJson, null, 2)}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Loading paper…
            </div>
          )}

          {/* Two-column layout */}
          {!loading && questions.length > 0 && (
            <div className="grid grid-cols-[1fr_264px] gap-5 items-start">

              {/* ── Left: Extracted Questions ─────────────────────────────── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">1</div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Extracted Questions</span>
                      <p className="text-xs text-gray-400 mt-0.5">AI-parsed content from your paper · review before creating rubric</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                    {totalMarks > 0 && <span className="font-medium text-gray-600">{totalMarks} marks total</span>}
                    {examMeta && (
                      <>
                        <span>·</span>
                        <span>{examMeta.name}</span>
                      </>
                    )}
                    <button className="ml-1 p-1 text-gray-300 hover:text-gray-500 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {displayQuestions.map((q) => (
                    <QuestionCard
                      key={q.canonical_question_id}
                      question={q}
                      rubric={rubrics[q.canonical_question_id]}
                      isFinalized={isFinalized}
                      isRubricGenerating={isGenerating}
                      isSaving={savingCid === q.canonical_question_id}
                      onRubricChange={handleRubricChange}
                    />
                  ))}
                </div>
              </div>

              {/* ── Right: Sidebar ────────────────────────────────────────── */}
              <div className="space-y-3">

                {/* Rubric card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${
                        isFinalized ? 'bg-green-500' : isGenerating ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>2</div>
                      <span className="text-sm font-semibold text-gray-900">Rubric</span>
                    </div>
                    <RubricStatusBadge status={status} isGenerating={isGenerating} />
                  </div>
                  <p className="text-xs text-gray-400 pl-7 mb-3">Auto-generated from your paper · editable before finalizing</p>

                  {isGenerating && rubricStatus && (
                    <div className="pl-7 mb-3 space-y-2">
                      <p className="text-xs text-orange-500">Generating rubric from paper… this may take a moment.</p>
                      {rubricStatus.progress.total > 0 ? (
                        <>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-orange-400 rounded-full transition-all duration-700"
                              style={{ width: `${Math.round((rubricStatus.progress.done / rubricStatus.progress.total) * 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-gray-400">{rubricStatus.progress.done} of {rubricStatus.progress.total} questions</p>
                            <p className="text-[11px] font-medium text-orange-500">{Math.round((rubricStatus.progress.done / rubricStatus.progress.total) * 100)}%</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-2 w-1/3 bg-orange-300 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Questions not yet finalized */}
                  {!isQuestionsFinalized && !rubricStatus && (
                    <button
                      onClick={handleFinalizeQuestions}
                      disabled={actionLoading}
                      className="w-full mt-1 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
                    >
                      {actionLoading ? 'Finalising…' : 'Finalise & generate rubric'}
                    </button>
                  )}

                  {/* Questions finalized but rubric not started yet */}
                  {isQuestionsFinalized && !rubricStatus && !isGenerating && (
                    <button
                      onClick={handleGenerate}
                      disabled={actionLoading}
                      className="w-full mt-1 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
                    >
                      {actionLoading ? 'Starting…' : 'Generate rubric'}
                    </button>
                  )}

                  {/* Regenerate button */}
                  {rubricStatus && !isFinalized && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating || actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <svg className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate
                      </button>
                      <button
                        onClick={handleFinalizeRubric}
                        disabled={isGenerating || actionLoading}
                        className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
                      >
                        Finalize
                      </button>
                    </div>
                  )}

                  {isFinalized && (
                    <p className="text-xs text-green-600 pl-7 mt-1">
                      Rubric ready (v{rubricStatus?.rubric_version}) · {approvedCount}/{questions.length} approved
                    </p>
                  )}
                </div>

                {/* Sample Answer card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-white text-[11px] font-bold shrink-0">3</div>
                      <span className="text-sm font-semibold text-gray-900">Sample Answer</span>
                      <span className="text-[10px] font-medium text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 leading-tight">optional</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 pl-7 mb-3">Upload a model answer to improve grading accuracy</p>

                  {sampleAnswerFile ? (
                    <div className="pl-7 space-y-2">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-xs text-gray-700 truncate flex-1">{sampleAnswerFile.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">Processing…</span>
                      </div>
                      <button
                        onClick={() => document.getElementById('sample-answer-upload')?.click()}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Replace sample answer PDF / DOCX
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => document.getElementById('sample-answer-upload')?.click()}
                      className="ml-7 flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500 hover:border-gray-400 hover:bg-gray-100 transition-colors w-[calc(100%-1.75rem)]"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload PDF / DOCX
                    </button>
                  )}
                  <input
                    id="sample-answer-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setSampleAnswerFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                {/* Ready to grade card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Ready to grade?</h3>
                  <p className="text-xs text-gray-400 mb-4">Upload student submissions and start auto-grading</p>
                  <Link
                    href={`/grading/${paperId}`}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Start Grading
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

              </div>
            </div>
          )}

          {/* Empty state when no paper loaded yet but modal dismissed */}
          {!loading && !loadError && questions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">No paper loaded</p>
              <p className="text-xs text-gray-400">Upload an assignment spec sheet to get started</p>
              <button
                onClick={() => setShowSetup(true)}
                className="mt-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                Load a paper
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
