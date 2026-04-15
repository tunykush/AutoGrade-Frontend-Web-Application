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
  question_text: string
  max_marks: number
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

interface MasterJson {
  paper_id: number
  questions: Question[]
  exam_meta?: { name: string; code: string; total_marks: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenQuestions(questions: Question[]): Question[] {
  const out: Question[] = []
  const walk = (qs: Question[]) => {
    for (const q of qs) {
      out.push(q)
      if (q.parts?.length) walk(q.parts)
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

const ACTIVE_STATUSES = new Set(['PENDING', 'GENERATING', 'IN_PROGRESS', 'RUNNING', 'QUEUED'])
const TERMINAL_STATUSES = new Set(['READY', 'FINALIZED', 'FAILED', 'TIMEOUT'])

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ onSetup }: { onSetup: () => void }) {
  return (
    <header className="bg-[#f2f2f0] border-b border-gray-200 px-6 py-3">
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Edgen AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onSetup} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Setup
          </button>
          <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">A</div>
        </div>
      </div>
    </header>
  )
}

// ─── Login modal ──────────────────────────────────────────────────────────────

function LoginModal({
  onSuccess,
}: {
  onSuccess: (token: string) => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }
      onSuccess(data.access_token)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-900">Sign in to Edgen AI</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your username"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={!username.trim() || !password.trim() || loading}
          className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}

// ─── Setup modal ──────────────────────────────────────────────────────────────

function SetupModal({
  paperId,
  token,
  onPaperId,
  onToken,
  onLoad,
  onClose,
  loading,
}: {
  paperId: string
  token: string
  onPaperId: (v: string) => void
  onToken: (v: string) => void
  onLoad: () => void
  onClose: () => void
  loading: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const authHeader = token ? { 'X-Auth-Token': token } : {}

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
        setUploadError(data.detail ?? data.error ?? `Error ${res.status}`)
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
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000))
        const statusRes = await fetch(`/api/paper/${pid}/status`, { headers: authHeader })
        if (statusRes.ok) {
          const s = await statusRes.json()
          if (s.status === 'READY' || s.paper_status === 'READY') { ready = true; break }
          if (s.status === 'FAILED' || s.paper_status === 'FAILED') {
            setUploadError('Paper processing failed')
            setUploadStatus(null)
            return
          }
        }
      }
      onPaperId(String(pid))
      setUploadStatus(ready ? `Ready — Paper ID ${pid}` : `Paper ID ${pid} (still processing)`)
    } catch {
      setUploadError('Upload failed')
      setUploadStatus(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Upload a paper</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

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

        {paperId && !uploading && (
          <button
            onClick={onLoad}
            disabled={loading}
            className="w-full rounded-lg border border-violet-300 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Loading…' : `Load paper #${paperId}`}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
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

// ─── Question rubric row ──────────────────────────────────────────────────────

function QuestionRubricRow({ question, rubric, isFinalized, isSaving, onChange }: {
  question: Question
  rubric: RubricEntry | undefined
  isFinalized: boolean
  isSaving: boolean
  onChange: (cid: string, updated: RubricEntry) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const empty: RubricEntry = { criteria_levels: [{ range: '', criteria: [''] }], approved_by_user: false }
  const [draft, setDraft] = useState<RubricEntry>(rubric ?? empty)

  // sync draft when rubric prop updates (e.g. after regenerate)
  useEffect(() => {
    if (rubric) setDraft(rubric)
  }, [rubric])

  const handleSave = () => {
    onChange(question.canonical_question_id, draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(rubric ?? empty)
    setEditing(false)
  }

  const toggleApprove = () => {
    if (!rubric) return
    onChange(question.canonical_question_id, { ...rubric, approved_by_user: !rubric.approved_by_user })
  }

  const displayed = editing ? draft : (rubric ?? empty)
  const approved = rubric?.approved_by_user ?? false

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-10 shrink-0">
          <span className="inline-flex items-center justify-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
            {question.display_label}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 truncate">{question.question_text}</p>
          <p className="text-xs text-gray-400 mt-0.5">{question.max_marks} marks</p>
        </div>

        <div className="w-28 shrink-0">
          {approved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Approved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
              Pending
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setExpanded((v) => !v); setEditing(false) }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {expanded ? 'Hide' : 'View'}
          </button>
          {!isFinalized && (
            <>
              <button
                onClick={toggleApprove}
                disabled={isSaving || !rubric}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
                  approved
                    ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {approved ? 'Approved' : 'Approve'}
              </button>
              <button
                onClick={() => { setExpanded(true); setDraft(rubric ?? empty); setEditing(true) }}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
          <div className="pt-4 space-y-3">
            {editing ? (
              <>
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
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={handleCancel} className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                    {isSaving ? 'Saving…' : 'Save criteria'}
                  </button>
                </div>
              </>
            ) : displayed.criteria_levels.length === 0 || (displayed.criteria_levels.length === 1 && !displayed.criteria_levels[0].range && !displayed.criteria_levels[0].criteria[0]) ? (
              <p className="text-sm text-gray-400 italic">No criteria yet — click Edit to add.</p>
            ) : (
              displayed.criteria_levels.map((level, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Score range: <span className="text-gray-800">{level.range || '—'}</span>
                  </p>
                  <ul className="space-y-1">
                    {level.criteria.map((c, j) => (
                      <li key={j} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-gray-300 shrink-0">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RubricTestPage() {
  const [showSetup, setShowSetup] = useState(true)
  const [paperId, setPaperId] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    fetch('/api/debug/token').then(r => r.ok ? r.json() : null).then(d => { if (d?.token) setToken(d.token) })
  }, [])

  const [questions, setQuestions] = useState<Question[]>([])
  const [rubrics, setRubrics] = useState<RubricMap>({})
  const [rubricStatus, setRubricStatus] = useState<RubricStatus | null>(null)
  const [examMeta, setExamMeta] = useState<{ name: string; code: string; total_marks: number } | null>(null)

  const [paperStatus, setPaperStatus] = useState<Record<string, unknown> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingCid, setSavingCid] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
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
      if (ACTIVE_STATUSES.has(s.rubric_status)) {
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
      const st: string = s.status ?? s.paper_status ?? ''
      if (st && !['READY', 'FINALIZED', 'FAILED'].includes(st)) {
        paperPollRef.current = setTimeout(() => poll(interval), interval)
      }
    }
    poll()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPaper = useCallback(async () => {
    if (!paperId.trim()) return
    setLoading(true)
    setLoadError(null)

    try {
      const [statusRes, masterRes] = await Promise.all([
        fetch(`/api/rubric/${paperId}/status`, { headers: authHeaders }),
        fetch(`/api/paper/${paperId}/master-json`, { headers: authHeaders }),
      ])

      if (!statusRes.ok) {
        const err = await statusRes.json().catch(() => ({}))
        setLoadError(err.detail ?? err.error ?? `Error ${statusRes.status}`)
        setLoading(false)
        return
      }

      const status: RubricStatus = await statusRes.json()
      setRubricStatus(status)
      if (status.progress?.by_qnode && Object.keys(status.progress.by_qnode).length > 0) {
        setRubrics(rubricFromByQnode(status.progress.by_qnode))
      }
      if (ACTIVE_STATUSES.has(status.rubric_status)) startPolling(paperId)

      if (masterRes.ok) {
        const master: MasterJson = await masterRes.json()
        setQuestions(flattenQuestions(master.questions ?? []))
        if (master.exam_meta) setExamMeta(master.exam_meta)
      }

      startPaperStatusPolling(paperId)
      setShowSetup(false)
    } catch {
      setLoadError('Network error — check the dev server is running')
    } finally {
      setLoading(false)
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

  const handleFinalize = async () => {
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
  const isGenerating = status ? ACTIVE_STATUSES.has(status) : false
  const approvedCount = questions.filter((q) => rubrics[q.canonical_question_id]?.approved_by_user).length
  const connected = !showSetup && !!rubricStatus

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      <Nav onSetup={() => setShowSetup(true)} />

      {showSetup && (
        <SetupModal
          paperId={paperId}
          token={token}
          onPaperId={setPaperId}
          onToken={setToken}
          onLoad={loadPaper}
          onClose={() => { if (connected) setShowSetup(false) }}
          loading={loading}
        />
      )}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="#" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Papers
          </Link>
          <span className="text-gray-300">/</span>
          <span>{connected ? `Paper #${rubricStatus!.paper_id}` : 'Paper'}</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">Rubric</span>
        </nav>

        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grading Rubric</h1>
            <p className="mt-1 text-sm text-gray-500">
              {examMeta
                ? `${examMeta.name} · ${examMeta.code} · ${examMeta.total_marks} marks`
                : 'Review and approve AI-generated rubric criteria before grading'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={!connected || isFinalized || isGenerating || actionLoading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isGenerating ? 'Generating…' : 'Regenerate'}
            </button>
            <button
              onClick={handleFinalize}
              disabled={!connected || isFinalized || isGenerating || actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Finalize rubric
            </button>
          </div>
        </div>

        {/* Paper status banner */}
        {connected && paperStatus && (() => {
          const st: string = (paperStatus.status ?? paperStatus.paper_status ?? '') as string
          if (!st || st === 'READY' || st === 'FINALIZED') return null
          const isProcessing = !['FAILED', 'READY', 'FINALIZED'].includes(st)
          return (
            <div className={`flex items-center gap-3 rounded-xl border px-5 py-3 ${
              st === 'FAILED'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              {isProcessing && (
                <svg className="w-4 h-4 text-blue-500 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <div>
                <p className={`text-sm font-medium ${st === 'FAILED' ? 'text-red-800' : 'text-blue-800'}`}>
                  Paper processing: <span className="font-semibold">{st}</span>
                </p>
                {paperStatus.message && (
                  <p className="text-xs text-blue-600 mt-0.5">{paperStatus.message as string}</p>
                )}
              </div>
            </div>
          )
        })()}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total questions" value={questions.length || '—'} />
          <StatCard label="Approved" value={approvedCount} color="text-blue-600" />
          <StatCard label="Finalized" value={isFinalized ? 1 : 0} color="text-violet-600" />
        </div>

        {/* Finalized banner */}
        {isFinalized && (
          <div className="flex items-center gap-3 rounded-xl bg-violet-50 border border-violet-200 px-5 py-3">
            <svg className="w-4 h-4 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <p className="text-sm text-violet-800 font-medium">
              Rubric finalized (v{rubricStatus?.rubric_version}) — no further edits allowed.
            </p>
          </div>
        )}

        {/* Questions table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Questions</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {rubricStatus && <span>v{rubricStatus.rubric_version}</span>}
              {rubricStatus && <span>·</span>}
              <span className={`font-medium ${
                !connected ? 'text-gray-400' :
                isFinalized ? 'text-violet-600' :
                isGenerating ? 'text-blue-500' : 'text-green-600'
              }`}>
                {!connected ? 'Not connected' : isFinalized ? 'Finalized' : isGenerating ? 'Generating…' : 'Ready'}
              </span>
              {isGenerating && rubricStatus && (
                <span className="text-gray-400">
                  · {rubricStatus.progress.done}/{rubricStatus.progress.total}
                </span>
              )}
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2.5rem_1fr_7rem_13rem] gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50">
            <span />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Question</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Actions</span>
          </div>

          {!connected ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              Click <button onClick={() => setShowSetup(true)} className="text-violet-600 font-medium hover:underline">Setup</button> to connect a paper
            </div>
          ) : questions.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              {isGenerating ? 'Generating rubric…' : 'No questions found for this paper'}
            </div>
          ) : (
            questions.map((q) => (
              <QuestionRubricRow
                key={q.canonical_question_id}
                question={q}
                rubric={rubrics[q.canonical_question_id]}
                isFinalized={isFinalized}
                isSaving={savingCid === q.canonical_question_id}
                onChange={handleRubricChange}
              />
            ))
          )}
        </div>

        {connected && !isFinalized && questions.length > 0 && (
          <p className="text-xs text-center text-gray-400">
            {approvedCount} of {questions.length} questions approved
            {approvedCount === questions.length && ' — ready to finalize'}
          </p>
        )}
      </div>
    </div>
  )
}
