'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import EdgenTopBar from '@/components/auth/grading/Edgen'

interface Paper {
  paper_id: number
  validation_status: string
  is_finalized: boolean
  total_marks: number | null
  message?: string
  created_at?: string
}

const DEMO_PAPERS: Paper[] = [
  { paper_id: 38, validation_status: 'SUCCESS', is_finalized: true, total_marks: 100, created_at: '2026-03-22T04:00:00Z' },
  { paper_id: 37, validation_status: 'SUCCESS', is_finalized: true, total_marks: 50, created_at: '2026-03-15T04:00:00Z' },
  { paper_id: 36, validation_status: 'PENDING', is_finalized: false, total_marks: null, created_at: '2026-03-10T04:00:00Z' },
]

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

//   useEffect(() => {
//     async function loadPapers() {
//       try {
//         const res = await fetch('/api/papers')
//         const data = await res.json()
//         if (res.ok && Array.isArray(data) && data.length > 0) {
//           setPapers(data)
//           setIsDemo(false)
//         } else {
//           setPapers(DEMO_PAPERS)
//           setIsDemo(true)
//         }
//       } catch {
//         setPapers(DEMO_PAPERS)
//         setIsDemo(true)
//       } finally {
//         setLoading(false)
//       }
//     }
//     loadPapers()
//   }, [])

async function loadPapers() {
  try {
    const res = await fetch('/api/papers')
    const data = await res.json()
    if (res.ok && Array.isArray(data)) {
      setPapers(data)
    }
  } catch {
    // silently fail — shows empty list
  } finally {
    setLoading(false)
  }
}
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <EdgenTopBar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">My Papers</h1>
          {isDemo && (
            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
              Demo data — no papers in your account yet
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading papers...</div>
        ) : (
          <div className="space-y-3">
            {papers.map(paper => (
              <div
                key={paper.paper_id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="font-semibold text-[#111827]">Paper #{paper.paper_id}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {paper.total_marks ? `${paper.total_marks} marks` : 'Marks pending'} ·{' '}
                    {paper.is_finalized ? 'Finalized' : 'Draft'}
                  </div>
                </div>
                <Link
                  href={`/papers/${paper.paper_id}/grade`}
                  className="bg-[#5B21B6] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#4C1D95] transition"
                >
                  Grade
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}