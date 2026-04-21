'use client'

import React, { useState, useEffect } from 'react'
import type { GradingJSON, ReviewOverride } from '@/lib/autograde'

interface ReviewModalProps {
  submissionId: number
  paperId: number
  gradingData: GradingJSON | null
  loading: boolean
  onClose: () => void
  onApplyOverrides: (overrides: ReviewOverride[]) => Promise<void>
}

export default function ReviewModal({
  submissionId,
  gradingData,
  loading,
  onClose,
  onApplyOverrides,
}: ReviewModalProps) {
  const [overrides, setOverrides] = useState<Record<string, { score: string; reason: string; feedback: string }>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (gradingData) {
      const initial: typeof overrides = {}
      for (const [cid, q] of Object.entries(gradingData.question_results)) {
        initial[cid] = {
          score: q.final_score !== null && q.final_score !== undefined ? String(q.final_score) : '',
          reason: '',
          feedback: '',
        }
      }
      setOverrides(initial)
    }
  }, [gradingData])

  async function handleSave() {
    if (!gradingData) return
    const changed: ReviewOverride[] = []
    for (const [cid, vals] of Object.entries(overrides)) {
      const q = gradingData.question_results[cid]
      const newScore = parseFloat(vals.score)
      if (!isNaN(newScore) && (q.final_score === null || newScore !== q.final_score) && vals.reason.trim()) {
        changed.push({
          canonical_question_id: cid,
          override_score: newScore,
          reason: vals.reason,
          feedback: vals.feedback || undefined,
        } as ReviewOverride)
      }
    }
    if (changed.length === 0) { onClose(); return }
    setSaving(true)
    try {
      await onApplyOverrides(changed)
      setSaved(true)
      setTimeout(() => onClose(), 1000)
    } catch (e) {
      alert('Failed to save: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const questions = gradingData ? Object.values(gradingData.question_results) : []
  const totalAwarded = gradingData?.summary?.totals.awarded_score ?? null
  const totalMax = gradingData?.summary?.totals.max_score ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Review Grading</h2>
            <p className="text-sm text-gray-500">Submission #{submissionId}</p>
          </div>
          {totalAwarded !== null && (
            <div className="text-right">
              <div className="text-2xl font-bold text-[#5B21B6]">
                {totalAwarded}<span className="text-gray-400 text-base font-normal">/{totalMax}</span>
              </div>
              <div className="text-xs text-gray-500">Total Score</div>
            </div>
          )}
          <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading grading data...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No grading data available yet.</div>
          ) : (
            questions.map((q) => {
              const cid = q.canonical_question_id
              const override = overrides[cid] || { score: '', reason: '', feedback: '' }
              return (
                <div key={cid} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-800">{q.display_label}</span>
                      <span className="ml-2 text-xs text-gray-400">max {q.max_marks} marks</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === 'REVIEWED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {q.status || 'GRADED'}
                    </span>
                  </div>
                  {q.evaluations && q.evaluations.length > 0 && (
                    <div className="mb-3 text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
                      <div className="text-xs font-medium text-gray-400 mb-1">AI Rationale</div>
                      <p>{q.evaluations[0].rationale}</p>
                      <div className="mt-1 text-xs text-gray-400">Score: {q.evaluations[0].score} · Model: {q.evaluations[0].model}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Override Score</label>
                      <input
                        type="number"
                        min={0}
                        max={q.max_marks}
                        step={0.5}
                        value={override.score}
                        onChange={e => setOverrides(prev => ({ ...prev, [cid]: { ...prev[cid], score: e.target.value } }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#5B21B6]"
                        placeholder={q.final_score !== null ? String(q.final_score) : '—'}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Reason (required to override)</label>
                      <input
                        type="text"
                        value={override.reason}
                        onChange={e => setOverrides(prev => ({ ...prev, [cid]: { ...prev[cid], reason: e.target.value } }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#5B21B6]"
                        placeholder="e.g. manual review"
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 text-sm bg-[#5B21B6] text-white rounded-lg hover:bg-[#4C1D95] disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Overrides'}
          </button>
        </div>
      </div>
    </div>
  )
}