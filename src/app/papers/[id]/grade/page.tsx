'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Upload, X, FileText, Loader2, Lock, RefreshCw,
  CheckCircle2, GraduationCap, Settings, Trash2, Download,
} from 'lucide-react';
import { Submission, GradeFile } from '@/components/papers/types';
import { normalizeStatus, isActive, StatusBadge } from '@/components/papers/StatusBadge';
import Navbar from '@/components/ui/Navbar';

function CircleProgress({ progress }: { progress: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 -rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke="#0f172a" strokeWidth="4"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ - (progress / 100) * circ}
        className="transition-all duration-300"
      />
    </svg>
  );
}

export default function GradePage() {
  const params = useParams();
  const router = useRouter();
  const paperId = Number(params.id);
  const [paperName, setPaperName] = React.useState<string>(`Paper #${paperId}`);

  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('paperFileNames') ?? '{}');
    if (stored[paperId]) setPaperName(stored[paperId]);
  }, [paperId]);

  // ── Submissions ───────────────────────────────────────────────────────────
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = React.useState(true);
  const sseMap = React.useRef<Map<number, EventSource>>(new Map());

  const pollFallback = React.useCallback((submissionId: number) => {
    // Fallback polling when SSE is unavailable. Polls every 8s until terminal.
    const poll = async () => {
      try {
        const res = await fetch(`/api/ag/status?submission_id=${submissionId}&stream=false`, { cache: 'no-store' });
        if (!res.ok) return;
        const d = await res.json().catch(() => null);
        if (!d) return;
        const newStatus = normalizeStatus(d.validation_status ?? d.status ?? '');
        if (!newStatus) return;
        setSubmissions((prev) =>
          prev.map((s) =>
            s.submission_id === submissionId
              ? { ...s, validation_status: newStatus,
                  total_score: d.total_score ?? d.score ?? s.total_score,
                  max_score: d.max_score ?? d.total_max_score ?? s.max_score,
                  is_finalized: newStatus === 'FINALIZED' }
              : s
          )
        );
        if (!['SUCCESS', 'FINALIZED', 'FAILED', 'TIMEOUT'].includes(newStatus)) {
          setTimeout(poll, 8_000);
        }
      } catch {
        setTimeout(poll, 10_000);
      }
    };
    setTimeout(poll, 5_000);
  }, []);

  const startSSE = React.useCallback((submissionId: number) => {
    if (sseMap.current.has(submissionId)) return;
    const es = new EventSource(`/api/ag/status?submission_id=${submissionId}`);
    sseMap.current.set(submissionId, es);
    let receivedEvent = false;

    es.onmessage = (evt) => {
      receivedEvent = true;
      try {
        const d = JSON.parse(evt.data);
        const newStatus = normalizeStatus(d.validation_status ?? d.status ?? '');
        setSubmissions((prev) =>
          prev.map((s) =>
            s.submission_id === submissionId
              ? { ...s, validation_status: newStatus,
                  total_score: d.total_score ?? d.score ?? s.total_score,
                  max_score: d.max_score ?? d.total_max_score ?? s.max_score,
                  is_finalized: newStatus === 'FINALIZED' }
              : s
          )
        );
        if (['SUCCESS', 'FINALIZED', 'FAILED', 'TIMEOUT'].includes(newStatus)) {
          es.close(); sseMap.current.delete(submissionId);
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => {
      es.close();
      sseMap.current.delete(submissionId);
      // If SSE failed before any event, fall back to polling
      if (!receivedEvent) pollFallback(submissionId);
    };
  }, [pollFallback]);

  const loadSubmissions = React.useCallback(async () => {
    setLoadingSubs(true);
    try {
      const res = await fetch(`/api/ag/list-submissions?paper_id=${paperId}`, { cache: 'no-store' });
      const data = await res.json().catch(() => []);
      // Backend may return a raw array OR a wrapper object { submissions: [...] }
      const raw: Submission[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.submissions) ? data.submissions
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.results) ? data.results
        : [];
      const normalized = raw.map((s: Submission) => ({
        ...s,
        validation_status: normalizeStatus(s.validation_status),
        student_id: s.student_id && s.student_id !== 'NONE' ? s.student_id : null,
      }));
      setSubmissions(normalized);
      normalized.forEach((s: Submission) => { if (isActive(s.validation_status)) startSSE(s.submission_id); });
    } catch { setSubmissions([]); }
    finally { setLoadingSubs(false); }
  }, [paperId, startSSE]);

  React.useEffect(() => {
    loadSubmissions();
    return () => { sseMap.current.forEach((es) => es.close()); sseMap.current.clear(); };
  }, [loadSubmissions]);

  // ── Upload grading files ──────────────────────────────────────────────────
  const [gradeFiles, setGradeFiles] = React.useState<GradeFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUpload = React.useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const picked = Array.from(fileList).slice(0, 20);
    const newFiles: GradeFile[] = picked.map((file, i) => ({ id: Date.now() + i, file, progress: 0, done: false }));
    setGradeFiles((prev) => [...newFiles, ...prev]);

    for (const gf of newFiles) {
      let p = 0;
      const ticker = setInterval(() => {
        p += Math.floor(Math.random() * 15) + 5;
        setGradeFiles((prev) => prev.map((f) => f.id === gf.id ? { ...f, progress: Math.min(p, 85) } : f));
      }, 200);

      try {
        const fd = new FormData();
        fd.append('file', gf.file);
        fd.append('paper_id', String(paperId));
        fd.append('exam_id', '1');
        const res = await fetch('/api/ag/upload-grade', { method: 'POST', body: fd });
        const data = await res.json().catch(() => null);
        clearInterval(ticker);
        if (!res.ok) throw new Error(data?.error || data?.message || 'Upload failed');

        const submissionId: number = data?.submission_id ?? data?.Assignment_id;
        setGradeFiles((prev) => prev.map((f) => f.id === gf.id ? { ...f, progress: 100, done: true } : f));

        if (submissionId) {
          const initStatus = normalizeStatus(data.validation_status ?? 'PENDING');
          setSubmissions((prev) => {
            if (prev.find((s) => s.submission_id === submissionId)) return prev;
            return [{ submission_id: submissionId, student_id: gf.file.name.replace(/\.[^.]+$/, ''),
              validation_status: initStatus, total_score: null, max_score: null, is_finalized: false }, ...prev];
          });
          if (isActive(initStatus)) startSSE(submissionId);
        }
      } catch (err) {
        clearInterval(ticker);
        setGradeFiles((prev) => prev.map((f) => f.id === gf.id ? { ...f, progress: 0, error: err instanceof Error ? err.message : 'Upload failed' } : f));
      }
    }
  }, [paperId, startSSE]);

  // ── Finalize ──────────────────────────────────────────────────────────────
  const [finalizing, setFinalizing] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);

  const deleteSubmission = async (submissionId: number) => {
    setDeletingId(submissionId);
    try {
      const res = await fetch(`/api/ag/delete-submission?submission_id=${submissionId}`, { method: 'DELETE' });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.submission_id !== submissionId));
        setConfirmDeleteId(null);
      }
    } catch { /* ignore */ }
    finally { setDeletingId(null); }
  };

  const finalizeSubmission = async (submissionId: number) => {
    setFinalizing(submissionId);
    try {
      const res = await fetch('/api/ag/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId }),
      });
      if (!res.ok) return;
      setSubmissions((prev) => prev.map((s) =>
        s.submission_id === submissionId ? { ...s, validation_status: 'FINALIZED', is_finalized: true } : s
      ));
    } catch { /* ignore */ }
    finally { setFinalizing(null); }
  };

const handleExportCSV = () => {
  try {
    if (submissions.length === 0) {
      alert('No submissions available to export.');
      return;
    }

  const csvData = submissions.map((sub) => ({
    "Student ID": `"${sub.student_id ?? `Submission #${sub.submission_id}`}"`,
    Score:
      sub.total_score !== null && sub.max_score !== null
        ? `"${sub.total_score} / ${sub.max_score}"`
        : sub.total_score !== null
        ? `"${sub.total_score}"`
        : `"—"`,
  }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${paperName.replace(/\s+/g, '_')}_scores.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV export failed:', error);
    alert('Failed to export CSV');
  }
};

  const finalizedCount = submissions.filter((s) => s.validation_status === 'FINALIZED').length;
  const successCount = submissions.filter((s) => s.validation_status === 'SUCCESS').length;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div> */}
      <div className="relative z-10"></div>
      
      <div className="relative z-10">
        <Navbar variant="light" />
        <div className="px-6 py-8 md:px-12 space-y-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2.5 text-sm">
            <button
              onClick={() => router.push('/papers')}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-400 hover:bg-slate-700/40 hover:text-slate-200 transition-colors duration-150"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Papers
            </button>
            <span className="text-slate-500">/</span>
            <span className="font-medium text-slate-300 truncate">{paperName}</span>
            <span className="text-slate-500">/</span>
            <span className="font-semibold text-white">Grade</span>
          </div>

          {/* Page header with actions */}
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">Grade Submissions</h1>
              <p className="mt-4 text-lg text-slate-300 max-w-xl">Upload student answer sheets and review AI-powered grading results instantly</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={submissions.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/40 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg hover:shadow-xl hover:bg-slate-700/40 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-slate-800/40 transition-all duration-200"
                title={submissions.length === 0 ? 'No submissions to export' : 'Export submissions as CSV'}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => router.push(`/papers/${paperId}/setup`)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
                Setup
              </button>
            </div>
          </div>

          {/* Stats + Upload — side by side on wide screens */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">

            {/* Left: Stats */}
            <div className="grid grid-cols-3 gap-4 content-start">
              {[
                { label: 'Total Submissions', value: submissions.length, borderColor: 'from-blue-500/20 to-transparent' },
                { label: 'Ready to Review', value: successCount, borderColor: 'from-sky-500/20 to-transparent' },
                { label: 'Finalized', value: finalizedCount, borderColor: 'from-emerald-500/20 to-transparent' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group relative rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm px-6 py-5 shadow-xl hover:shadow-2xl hover:border-slate-600 transition-all duration-300"
                >
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${stat.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-4xl font-bold text-white tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Upload zone */}
            <div data-guide="grade-upload" className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 pl-1">Upload Answer Sheets</h2>
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files); }}
                className={`block cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10 backdrop-blur-sm'
                    : 'border-slate-700 bg-slate-800/30 backdrop-blur-sm hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-500/30">
                    <Upload className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Drop files here</p>
                    <p className="mt-1 text-xs text-slate-400">PDF / DOCX • up to 20 files • 5 MB each</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                    className="mt-2 rounded-lg border border-slate-600 bg-slate-800/40 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-slate-200 shadow-lg hover:shadow-xl hover:bg-slate-700/40 hover:border-slate-500 transition-all duration-200"
                  >
                    Browse Files
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              </label>

              {gradeFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  {gradeFiles.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur-sm px-4 py-2.5 shadow-lg hover:shadow-xl hover:bg-slate-800/50 transition-all">
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                        <CircleProgress progress={f.progress} />
                        <Upload className="absolute h-3 w-3 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{f.file.name}</p>
                        <p className="text-xs text-slate-400">
                          {f.error ? <span className="text-rose-400 font-medium">{f.error}</span>
                            : f.done ? <span className="text-emerald-400 font-medium">Uploaded • grading in progress</span>
                            : `Uploading ${f.progress}%`}
                        </p>
                      </div>
                      <button type="button" onClick={() => setGradeFiles((p) => p.filter((g) => g.id !== f.id))} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>{/* end stats+upload grid */}

          {/* Submissions table */}
          <div data-guide="grade-submissions" className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Submissions</h2>
              <button
                onClick={loadSubmissions}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/40 hover:text-slate-300 transition-colors"
                title="Refresh submissions"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            {loadingSubs ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="mb-3 h-6 w-6 animate-spin text-slate-300" />
                <p className="text-sm font-medium text-slate-400">Loading submissions…</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/30">
                  <GraduationCap className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-base font-semibold text-slate-300">No submissions yet</p>
                <p className="mt-1 text-sm text-slate-400">Upload student answer sheets above to begin grading</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/20 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {submissions.map((sub) => {
                    const norm = sub.validation_status;
                    const canReview = norm === 'SUCCESS' || norm === 'FINALIZED';
                    const canFinalize = norm === 'SUCCESS' && !sub.is_finalized;
                    const isFinalizing = finalizing === sub.submission_id;
                    const scoreStr = sub.total_score !== null && sub.max_score !== null
                      ? `${sub.total_score} / ${sub.max_score}`
                      : sub.total_score !== null ? String(sub.total_score) : '—';

                    return (
                      <tr key={sub.submission_id} className="hover:bg-slate-700/20 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">{sub.student_id ?? `Submission #${sub.submission_id}`}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">ID: {sub.submission_id}</p>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={norm} /></td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-200">{scoreStr}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canReview && (
                              <button
                                type="button"
                                onClick={() => router.push(`/papers/${paperId}/grade/${sub.submission_id}`)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/40 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-slate-200 shadow-lg hover:shadow-xl hover:bg-slate-700/40 hover:border-slate-500 transition-all duration-200"
                              >
                                <FileText className="h-3.5 w-3.5" /> Review
                              </button>
                            )}
                            {canFinalize && (
                              <button
                                type="button"
                                disabled={isFinalizing}
                                onClick={() => finalizeSubmission(sub.submission_id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                {isFinalizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Lock className="h-3.5 w-3.5" /> Finalize</>}
                              </button>
                            )}
                            {norm === 'FINALIZED' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Done
                              </span>
                            )}
                            {/* Delete */}
                            {confirmDeleteId === sub.submission_id ? (
                              <div className="flex items-center gap-2 rounded-lg border border-rose-600/40 bg-rose-950/30 px-3 py-2">
                                <span className="text-xs font-semibold text-rose-400">Delete?</span>
                                <button type="button" disabled={deletingId === sub.submission_id}
                                  onClick={() => deleteSubmission(sub.submission_id)}
                                  className="rounded px-2 py-1 text-xs font-bold text-rose-400 hover:bg-rose-900/40 disabled:opacity-60 transition-colors">
                                  {deletingId === sub.submission_id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
                                </button>
                                <button type="button" onClick={() => setConfirmDeleteId(null)}
                                  className="rounded px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-700/40 transition-colors">No</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setConfirmDeleteId(sub.submission_id)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-rose-950/30 hover:text-rose-400 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}