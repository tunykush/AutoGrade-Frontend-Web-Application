// 'use client'

// import React, { useState, useEffect, useRef, useCallback } from 'react'
// import Link from 'next/link'
// import { useParams } from 'next/navigation'
// import EdgenTopBar from '@/components/auth/grading/Edgen'
// import ReviewModal from '@/components/auth/grading/ReviewModal'
// import {
//   listSubmissions,
//   uploadAndGrade,
//   getSubmissionStatus,
//   getGradingJSON,
//   applyReview,
//   finalizeSubmission,
//   normalizeStatus,
//   isTerminalStatus,
//   type Submission,
//   type GradingJSON,
//   type ReviewOverride,
//   type NormalizedStatus,
// } from '@/lib/autograde'

// interface UploadingFile {
//   file: File
//   submissionId: number | null
//   status: 'uploading' | 'grading' | 'done' | 'error'
//   errorMsg?: string
// }

// function StatusBadge({ status, isFinalized }: { status: string; isFinalized: boolean }) {
//   if (isFinalized) {
//     return (
//       <span className="inline-flex items-center gap-1.5 text-sm text-purple-700 font-medium">
//         <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
//         Finalized
//       </span>
//     )
//   }

//   const norm: NormalizedStatus = normalizeStatus(status)

//   const dotColor: Record<NormalizedStatus, string> = {
//     SUCCESS: '#16a34a',
//     FAILED: '#dc2626',
//     PENDING: '#d97706',
//     RUNNING: '#3b82f6',
//     FINALIZED: '#7c3aed',
//   }
//   const labelMap: Record<NormalizedStatus, string> = {
//     SUCCESS: 'Ready',
//     FAILED: 'Failed',
//     PENDING: 'Pending',
//     RUNNING: 'Grading…',
//     FINALIZED: 'Finalized',
//   }
//   const textColorMap: Record<NormalizedStatus, string> = {
//     SUCCESS: 'text-green-700',
//     FAILED: 'text-red-700',
//     PENDING: 'text-yellow-700',
//     RUNNING: 'text-blue-700',
//     FINALIZED: 'text-purple-700',
//   }

//   return (
//     <span className={`inline-flex items-center gap-1.5 text-sm ${textColorMap[norm]} font-medium`}>
//       {norm === 'RUNNING' ? (
//         <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
//       ) : (
//         <span className="w-2 h-2 rounded-full inline-block" style={{ background: dotColor[norm] }} />
//       )}
//       {labelMap[norm]}
//     </span>
//   )
// }

// export default function GradePage() {
//   const params = useParams()
//   const paperId = Number(params.paperId)

//   const [submissions, setSubmissions] = useState<Submission[]>([])
//   const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
//   const [dragging, setDragging] = useState(false)
//   const [loadingList, setLoadingList] = useState(true)
//   const [refreshing, setRefreshing] = useState(false)

//   const [reviewOpen, setReviewOpen] = useState(false)
//   const [reviewSubmissionId, setReviewSubmissionId] = useState<number | null>(null)
//   const [gradingData, setGradingData] = useState<GradingJSON | null>(null)
//   const [gradingLoading, setGradingLoading] = useState(false)

//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const pollingRefs = useRef<Record<number, ReturnType<typeof setInterval>>>({})

//   const loadSubmissions = useCallback(async (quiet = false) => {
//     if (!quiet) setLoadingList(true)
//     else setRefreshing(true)
//     try {
//       const data = await listSubmissions(paperId)
//       setSubmissions(Array.isArray(data) ? data : [])
//       data.forEach((sub: Submission) => {
//         const norm = normalizeStatus(sub.validation_status)
//         if (!isTerminalStatus(norm) && !pollingRefs.current[sub.submission_id]) {
//           startPolling(sub.submission_id)
//         }
//       })
//     } catch {
//       setSubmissions([])
//     } finally {
//       setLoadingList(false)
//       setRefreshing(false)
//     }
//   }, [paperId])

//   useEffect(() => {
//     loadSubmissions()
//     return () => {
//       Object.values(pollingRefs.current).forEach(clearInterval)
//     }
//   }, [loadSubmissions])

//   function startPolling(submissionId: number) {
//     if (pollingRefs.current[submissionId]) return
//     const interval = setInterval(async () => {
//       try {
//         const statusData = await getSubmissionStatus(submissionId)
//         const norm = normalizeStatus(statusData.validation_status)
//         setSubmissions(prev =>
//           prev.map(s => s.submission_id === submissionId ? { ...s, ...statusData } : s)
//         )
//         if (isTerminalStatus(norm)) {
//           clearInterval(pollingRefs.current[submissionId])
//           delete pollingRefs.current[submissionId]
//           setUploadingFiles(prev =>
//             prev.map(f =>
//               f.submissionId === submissionId
//                 ? { ...f, status: norm === 'FAILED' ? 'error' : 'done' }
//                 : f
//             )
//           )
//         }
//       } catch {
//         // ignore polling errors silently
//       }
//     }, 5000)
//     pollingRefs.current[submissionId] = interval
//   }

//   async function handleFiles(files: FileList | File[]) {
//     const fileArr = Array.from(files).filter(
//       f => f.name.endsWith('.pdf') || f.name.endsWith('.docx')
//     )
//     if (fileArr.length === 0) return

//     for (const file of fileArr) {
//       const entry: UploadingFile = { file, submissionId: null, status: 'uploading' }
//       setUploadingFiles(prev => [...prev, entry])
//       try {
//         const result = await uploadAndGrade(paperId, file)
//         const submissionId = result.submission_id ?? result.Assignment_id ?? null
//         setUploadingFiles(prev =>
//           prev.map(f => f === entry ? { ...f, submissionId, status: 'grading' } : f)
//         )
//         if (submissionId) {
//           setSubmissions(prev => {
//             if (prev.find(s => s.submission_id === submissionId)) return prev
//             return [...prev, {
//               submission_id: submissionId,
//               student_id: null,
//               validation_status: result.validation_status || 'PENDING',
//               total_score: null,
//               max_score: null,
//               is_finalized: false,
//             }]
//           })
//           startPolling(submissionId)
//         }
//       } catch (e) {
//         setUploadingFiles(prev =>
//           prev.map(f => f === entry ? { ...f, status: 'error', errorMsg: (e as Error).message } : f)
//         )
//       }
//     }
//   }

//   async function openReview(submissionId: number) {
//     setReviewSubmissionId(submissionId)
//     setReviewOpen(true)
//     setGradingData(null)
//     setGradingLoading(true)
//     try {
//       const data = await getGradingJSON(submissionId)
//       setGradingData(data)
//     } catch {
//       setGradingData(null)
//     } finally {
//       setGradingLoading(false)
//     }
//   }

//   async function handleApplyOverrides(overrides: ReviewOverride[]) {
//     if (!reviewSubmissionId) return
//     await applyReview(paperId, reviewSubmissionId, overrides)
//     await loadSubmissions(true)
//   }

//   async function handleFinalize(submissionId: number) {
//     if (!confirm('Finalize this submission? This cannot be undone.')) return
//     try {
//       await finalizeSubmission(submissionId)
//       await loadSubmissions(true)
//     } catch (e) {
//       alert('Failed to finalize: ' + (e as Error).message)
//     }
//   }

//   const total = submissions.length
//   const readyToReview = submissions.filter(
//     s => normalizeStatus(s.validation_status) === 'SUCCESS' && !s.is_finalized
//   ).length
//   const finalized = submissions.filter(s => s.is_finalized).length

//   return (
//     <main className="min-h-screen bg-[#f5f5f5]">
//       <EdgenTopBar />

//       <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
//         <nav className="flex items-center gap-2 text-sm text-gray-500">
//           <Link href="/papers" className="hover:text-gray-800 flex items-center gap-1">
//             <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
//               <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
//             </svg>
//             Papers
//           </Link>
//           <span>/</span>
//           <span>Paper #{paperId}</span>
//           <span>/</span>
//           <span className="text-gray-900 font-semibold">Grade</span>
//         </nav>
//       </div>

//       <div className="max-w-5xl mx-auto px-6 py-4 space-y-5">
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-[#111827]">Grade Submissions</h1>
//             <p className="text-gray-500 text-sm mt-1">Upload student answer sheets and review AI grading</p>
//           </div>
//           <button className="flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
//             ⚙ Setup
//           </button>
//         </div>

//         <div className="grid grid-cols-3 gap-4">
//           {([
//             { label: 'Total', value: total, color: 'text-[#111827]' },
//             { label: 'Ready to review', value: readyToReview, color: 'text-blue-600' },
//             { label: 'Finalized', value: finalized, color: 'text-purple-600' },
//           ] as const).map(({ label, value, color }) => (
//             <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
//               <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
//               <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
//             </div>
//           ))}
//         </div>

//         <div>
//           <h2 className="text-sm font-semibold text-[#111827] mb-3">Upload Answer Sheets</h2>
//           <div
//             onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
//             onDragOver={e => { e.preventDefault(); setDragging(true) }}
//             onDragLeave={() => setDragging(false)}
//             className={`border-2 border-dashed rounded-2xl bg-white transition-all ${dragging ? 'border-[#5B21B6] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
//           >
//             <div className="flex flex-col items-center justify-center py-12">
//               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gray-400">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
//                 </svg>
//               </div>
//               <p className="text-gray-700 font-medium">Drop student answer sheets here</p>
//               <p className="text-gray-400 text-sm mt-1">PDF / DOCX · up to 20 files · 5 MB each</p>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".pdf,.docx"
//                 multiple
//                 className="hidden"
//                 onChange={e => e.target.files && handleFiles(e.target.files)}
//               />
//               <button
//                 onClick={() => fileInputRef.current?.click()}
//                 className="mt-5 border border-gray-200 bg-white text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 shadow-sm"
//               >
//                 Browse files
//               </button>
//             </div>
//           </div>
//         </div>

//         {uploadingFiles.length > 0 && (
//           <div className="space-y-2">
//             {uploadingFiles.map((uf, i) => (
//               <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
//                     {uf.status === 'uploading' || uf.status === 'grading' ? (
//                       <span className="w-4 h-4 border-2 border-[#5B21B6] border-t-transparent rounded-full animate-spin inline-block" />
//                     ) : uf.status === 'error' ? (
//                       <span className="text-red-500 text-xs font-bold">✕</span>
//                     ) : (
//                       <span className="text-green-500 text-xs font-bold">✓</span>
//                     )}
//                   </div>
//                   <div>
//                     <div className="text-sm font-medium text-gray-800">{uf.file.name}</div>
//                     <div className="text-xs mt-0.5">
//                       {uf.status === 'uploading' && <span className="text-gray-400">Uploading…</span>}
//                       {uf.status === 'grading' && <span>Uploaded · <span className="text-[#5B21B6]">grading in progress</span></span>}
//                       {uf.status === 'done' && <span className="text-green-600">Grading complete</span>}
//                       {uf.status === 'error' && <span className="text-red-500">{uf.errorMsg || 'Upload failed'}</span>}
//                     </div>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setUploadingFiles(prev => prev.filter((_, j) => j !== i))}
//                   className="text-gray-300 hover:text-gray-500 text-xl"
//                 >
//                   &times;
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
//           <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
//             <h2 className="text-base font-semibold text-[#111827]">Submissions</h2>
//             <button
//               onClick={() => loadSubmissions(true)}
//               title="Refresh"
//               className={`text-gray-400 hover:text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
//             >
//               <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
//                 <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
//               </svg>
//             </button>
//           </div>

//           {loadingList ? (
//             <div className="text-center py-16 text-gray-400">
//               <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-[#5B21B6] rounded-full animate-spin mb-3" />
//               <p>Loading submissions…</p>
//             </div>
//           ) : submissions.length === 0 ? (
//             <div className="text-center py-20">
//               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gray-400">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
//                 </svg>
//               </div>
//               <p className="text-gray-500 font-medium">No submissions yet</p>
//               <p className="text-gray-400 text-sm mt-1">Upload student answer sheets above to begin</p>
//             </div>
//           ) : (
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-50">
//                   <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Student</th>
//                   <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Status</th>
//                   <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Score</th>
//                   <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {submissions.map(sub => {
//                   const norm = normalizeStatus(sub.validation_status)
//                   const canFinalize = norm === 'SUCCESS' && !sub.is_finalized
//                   return (
//                     <tr key={sub.submission_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
//                       <td className="px-5 py-4">
//                         <div className="text-sm font-medium text-gray-900">{sub.student_id || 'Submission'}</div>
//                         <div className="text-xs text-gray-400">#{sub.submission_id}</div>
//                       </td>
//                       <td className="px-5 py-4">
//                         <StatusBadge status={sub.validation_status} isFinalized={sub.is_finalized} />
//                       </td>
//                       <td className="px-5 py-4 text-sm text-gray-700">
//                         {sub.total_score !== null && sub.max_score !== null
//                           ? `${sub.total_score} / ${sub.max_score}`
//                           : '—'}
//                       </td>
//                       <td className="px-5 py-4">
//                         <div className="flex items-center justify-end gap-2">
//                           {(norm === 'SUCCESS' || sub.is_finalized) && (
//                             <button
//                               onClick={() => openReview(sub.submission_id)}
//                               className="border border-gray-200 bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50"
//                             >
//                               Review
//                             </button>
//                           )}
//                           {canFinalize && (
//                             <button
//                               onClick={() => handleFinalize(sub.submission_id)}
//                               className="bg-[#5B21B6] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#4C1D95]"
//                             >
//                               🔒 Finalize
//                             </button>
//                           )}
//                           {sub.is_finalized && (
//                             <span className="text-xs text-purple-600 font-medium px-3 py-1.5 bg-purple-50 rounded-lg">
//                               Finalized
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>

//       {reviewOpen && reviewSubmissionId !== null && (
//         <ReviewModal
//           submissionId={reviewSubmissionId}
//           paperId={paperId}
//           gradingData={gradingData}
//           loading={gradingLoading}
//           onClose={() => setReviewOpen(false)}
//           onApplyOverrides={handleApplyOverrides}
//         />
//       )}
//     </main>
//   )
// }

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import EdgenTopBar from '@/components/auth/grading/Edgen'
import ReviewModal from '@/components/auth/grading/ReviewModal'
import {
  listSubmissions,
  uploadAndGrade,
  getSubmissionStatus,
  getGradingJSON,
  applyReview,
  finalizeSubmission,
  normalizeStatus,
  isTerminalStatus,
  type Submission,
  type GradingJSON,
  type ReviewOverride,
  type NormalizedStatus,
} from '@/lib/autograde'

interface UploadingFile {
  file: File
  submissionId: number | null
  status: 'uploading' | 'grading' | 'done' | 'error'
  errorMsg?: string
}

function StatusBadge({ status, isFinalized }: { status: string; isFinalized: boolean }) {
  if (isFinalized) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-purple-700 font-medium">
        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
        Finalized
      </span>
    )
  }

  const norm: NormalizedStatus = normalizeStatus(status)

  const dotColor: Record<NormalizedStatus, string> = {
    SUCCESS: '#16a34a',
    FAILED: '#dc2626',
    PENDING: '#d97706',
    RUNNING: '#3b82f6',
    FINALIZED: '#7c3aed',
  }
  const labelMap: Record<NormalizedStatus, string> = {
    SUCCESS: 'Ready',
    FAILED: 'Failed',
    PENDING: 'Pending',
    RUNNING: 'Grading…',
    FINALIZED: 'Finalized',
  }
  const textColorMap: Record<NormalizedStatus, string> = {
    SUCCESS: 'text-green-700',
    FAILED: 'text-red-700',
    PENDING: 'text-yellow-700',
    RUNNING: 'text-blue-700',
    FINALIZED: 'text-purple-700',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${textColorMap[norm]} font-medium`}>
      {norm === 'RUNNING' ? (
        <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: dotColor[norm] }} />
      )}
      {labelMap[norm]}
    </span>
  )
}

export default function GradePage() {
  const params = useParams()
  const paperId = Number(params.paperId)

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewSubmissionId, setReviewSubmissionId] = useState<number | null>(null)
  const [gradingData, setGradingData] = useState<GradingJSON | null>(null)
  const [gradingLoading, setGradingLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingRefs = useRef<Record<number, ReturnType<typeof setInterval>>>({})

  const loadSubmissions = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingList(true)
    else setRefreshing(true)
    try {
      const data = await listSubmissions(paperId)
      setSubmissions(Array.isArray(data) ? data : [])
      data.forEach((sub: Submission) => {
        const norm = normalizeStatus(sub.validation_status)
        if (!isTerminalStatus(norm) && !pollingRefs.current[sub.submission_id]) {
          startPolling(sub.submission_id)
        }
      })
    } catch {
      setSubmissions([])
    } finally {
      setLoadingList(false)
      setRefreshing(false)
    }
  }, [paperId])

  useEffect(() => {
    loadSubmissions()
    return () => {
      Object.values(pollingRefs.current).forEach(clearInterval)
    }
  }, [loadSubmissions])

  function startPolling(submissionId: number) {
    if (pollingRefs.current[submissionId]) return
    const interval = setInterval(async () => {
      try {
        const statusData = await getSubmissionStatus(submissionId)
        const norm = normalizeStatus(statusData.validation_status)
        setSubmissions(prev =>
          prev.map(s => s.submission_id === submissionId ? { ...s, ...statusData } : s)
        )
        if (isTerminalStatus(norm)) {
          clearInterval(pollingRefs.current[submissionId])
          delete pollingRefs.current[submissionId]
          setUploadingFiles(prev =>
            prev.map(f =>
              f.submissionId === submissionId
                ? { ...f, status: norm === 'FAILED' ? 'error' : 'done' }
                : f
            )
          )
        }
      } catch {
        // ignore polling errors silently
      }
    }, 5000)
    pollingRefs.current[submissionId] = interval
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArr = Array.from(files).filter(
      f => f.name.endsWith('.pdf') || f.name.endsWith('.docx')
    )
    if (fileArr.length === 0) return

    for (const file of fileArr) {
      const entry: UploadingFile = { file, submissionId: null, status: 'uploading' }
      setUploadingFiles(prev => [...prev, entry])
      try {
        const result = await uploadAndGrade(paperId, file)
        const submissionId = result.submission_id ?? result.Assignment_id ?? null
        setUploadingFiles(prev =>
          prev.map(f => f === entry ? { ...f, submissionId, status: 'grading' } : f)
        )
        if (submissionId) {
          setSubmissions(prev => {
            if (prev.find(s => s.submission_id === submissionId)) return prev
            return [...prev, {
              submission_id: submissionId,
              student_id: null,
              validation_status: result.validation_status || 'PENDING',
              total_score: null,
              max_score: null,
              is_finalized: false,
            }]
          })
          startPolling(submissionId)
        }
      } catch (e) {
        setUploadingFiles(prev =>
          prev.map(f => f === entry ? { ...f, status: 'error', errorMsg: (e as Error).message } : f)
        )
      }
    }
  }

  async function openReview(submissionId: number) {
    setReviewSubmissionId(submissionId)
    setReviewOpen(true)
    setGradingData(null)
    setGradingLoading(true)
    try {
      const data = await getGradingJSON(submissionId)
      setGradingData(data)
    } catch {
      setGradingData(null)
    } finally {
      setGradingLoading(false)
    }
  }

  async function handleApplyOverrides(overrides: ReviewOverride[]) {
    if (!reviewSubmissionId) return
    await applyReview(paperId, reviewSubmissionId, overrides)
    await loadSubmissions(true)
  }

  async function handleFinalize(submissionId: number) {
    if (!confirm('Finalize this submission? This cannot be undone.')) return
    try {
      await finalizeSubmission(submissionId)
      await loadSubmissions(true)
    } catch (e) {
      alert('Failed to finalize: ' + (e as Error).message)
    }
  }

  const total = submissions.length
  const readyToReview = submissions.filter(
    s => normalizeStatus(s.validation_status) === 'SUCCESS' && !s.is_finalized
  ).length
  const finalized = submissions.filter(s => s.is_finalized).length

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <EdgenTopBar />

      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/papers" className="hover:text-gray-800 flex items-center gap-1">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Papers
          </Link>
          <span>/</span>
          <span>Paper #{paperId}</span>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Grade</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Grade Submissions</h1>
            <p className="text-gray-500 text-sm mt-1">Upload student answer sheets and review AI grading</p>
          </div>
          <button
            onClick={() => setSetupOpen(true)}
            className="flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            ⚙ Setup
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {([
            { label: 'Total', value: total, color: 'text-[#111827]' },
            { label: 'Ready to review', value: readyToReview, color: 'text-blue-600' },
            { label: 'Finalized', value: finalized, color: 'text-purple-600' },
          ] as const).map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
              <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#111827] mb-3">Upload Answer Sheets</h2>
          <div
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            className={`border-2 border-dashed rounded-2xl bg-white transition-all ${dragging ? 'border-[#5B21B6] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Drop student answer sheets here</p>
              <p className="text-gray-400 text-sm mt-1">PDF / DOCX · up to 20 files · 5 MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                multiple
                className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 border border-gray-200 bg-white text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 shadow-sm"
              >
                Browse files
              </button>
            </div>
          </div>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            {uploadingFiles.map((uf, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                    {uf.status === 'uploading' || uf.status === 'grading' ? (
                      <span className="w-4 h-4 border-2 border-[#5B21B6] border-t-transparent rounded-full animate-spin inline-block" />
                    ) : uf.status === 'error' ? (
                      <span className="text-red-500 text-xs font-bold">✕</span>
                    ) : (
                      <span className="text-green-500 text-xs font-bold">✓</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{uf.file.name}</div>
                    <div className="text-xs mt-0.5">
                      {uf.status === 'uploading' && <span className="text-gray-400">Uploading…</span>}
                      {uf.status === 'grading' && <span>Uploaded · <span className="text-[#5B21B6]">grading in progress</span></span>}
                      {uf.status === 'done' && <span className="text-green-600">Grading complete</span>}
                      {uf.status === 'error' && <span className="text-red-500">{uf.errorMsg || 'Upload failed'}</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setUploadingFiles(prev => prev.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-gray-500 text-xl"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-[#111827]">Submissions</h2>
            <button
              onClick={() => loadSubmissions(true)}
              title="Refresh"
              className={`text-gray-400 hover:text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {loadingList ? (
            <div className="text-center py-16 text-gray-400">
              <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-[#5B21B6] rounded-full animate-spin mb-3" />
              <p>Loading submissions…</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No submissions yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload student answer sheets above to begin</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Score</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => {
                  const norm = normalizeStatus(sub.validation_status)
                  const canFinalize = norm === 'SUCCESS' && !sub.is_finalized
                  return (
                    <tr key={sub.submission_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">{sub.student_id || 'Submission'}</div>
                        <div className="text-xs text-gray-400">#{sub.submission_id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={sub.validation_status} isFinalized={sub.is_finalized} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {sub.total_score !== null && sub.max_score !== null
                          ? `${sub.total_score} / ${sub.max_score}`
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(norm === 'SUCCESS' || sub.is_finalized) && (
                            <button
                              onClick={() => openReview(sub.submission_id)}
                              className="border border-gray-200 bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50"
                            >
                              Review
                            </button>
                          )}
                          {canFinalize && (
                            <button
                              onClick={() => handleFinalize(sub.submission_id)}
                              className="bg-[#5B21B6] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#4C1D95]"
                            >
                              🔒 Finalize
                            </button>
                          )}
                          {sub.is_finalized && (
                            <span className="text-xs text-purple-600 font-medium px-3 py-1.5 bg-purple-50 rounded-lg">
                              Finalized
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewOpen && reviewSubmissionId !== null && (
        <ReviewModal
          submissionId={reviewSubmissionId}
          paperId={paperId}
          gradingData={gradingData}
          loading={gradingLoading}
          onClose={() => setReviewOpen(false)}
          onApplyOverrides={handleApplyOverrides}
        />
      )}

      {/* Setup Modal */}
      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Paper Setup</h2>
              <button onClick={() => setSetupOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Paper ID</label>
                <input
                  type="text"
                  value={`Paper #${paperId}`}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Grading Mode</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5B21B6]">
                  <option>AI Assisted</option>
                  <option>Manual Review</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setSetupOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setSetupOpen(false)}
                className="px-5 py-2 text-sm bg-[#5B21B6] text-white rounded-lg hover:bg-[#4C1D95]"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}