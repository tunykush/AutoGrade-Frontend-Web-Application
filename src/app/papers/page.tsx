'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  FileText,
  Settings,
  GraduationCap,
  Trash2,
  CheckCircle2,
  Clock3,
  ArrowRight,
  BookOpen,
  Eye,
  Pencil,
  Plus,
  Loader2,
} from 'lucide-react';
import { Paper } from '@/components/papers/types';
import { normalizeStatus } from '@/components/papers/StatusBadge';
import Navbar from '@/components/ui/Navbar';

function extractMsg(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const d = data as Record<string, unknown>;
  if (typeof d.error === 'string') return d.error;
  if (d.error && typeof d.error === 'object') {
    const e = d.error as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
  }
  if (typeof d.message === 'string') return d.message;
  if (typeof d.detail === 'string') return d.detail;
  return JSON.stringify(data);
}

function CircleProgress({ progress }: { progress: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r} fill="none" stroke="#0f172a" strokeWidth="4"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ - (progress / 100) * circ}
        className="transition-all duration-300"
      />
    </svg>
  );
}

type UploadFile = { id: number; file: File; progress: number; uploaded: boolean; error?: string };

// ── Create from scratch modal ─────────────────────────────────────────────
type ScratchSubPart = { label: string; text: string; max_marks: number };
type ScratchQuestion = { text: string; max_marks: number; subParts: ScratchSubPart[] };
const emptyScratchQ = (): ScratchQuestion => ({ text: '', max_marks: 0, subParts: [] });

function CreateFromScratchModal({ onClose, onCreated }: { onClose: () => void; onCreated: (paperId: number, name: string) => void }) {
  const [assignmentName, setAssignmentName] = React.useState('');
  const [questions, setQuestions] = React.useState<ScratchQuestion[]>([emptyScratchQ()]);
  const [saving, setSaving] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const addQuestion = () => setQuestions(qs => [...qs, emptyScratchQ()]);
  const removeQuestion = (i: number) => setQuestions(qs => qs.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, field: keyof ScratchQuestion, val: string | number) =>
    setQuestions(qs => { const n = [...qs]; n[i] = { ...n[i], [field]: val }; return n; });

  const addSubPart = (qi: number) =>
    setQuestions(qs => { const n = [...qs]; n[qi] = { ...n[qi], subParts: [...n[qi].subParts, { label: '', text: '', max_marks: 0 }] }; return n; });
  const removeSubPart = (qi: number, si: number) =>
    setQuestions(qs => { const n = [...qs]; n[qi] = { ...n[qi], subParts: n[qi].subParts.filter((_, idx) => idx !== si) }; return n; });
  const updateSubPart = (qi: number, si: number, field: keyof ScratchSubPart, val: string | number) =>
    setQuestions(qs => {
      const n = [...qs];
      const parts = [...n[qi].subParts];
      parts[si] = { ...parts[si], [field]: val };
      n[qi] = { ...n[qi], subParts: parts };
      return n;
    });

  const handleCreate = async () => {
    if (!assignmentName.trim()) return setErrMsg('Please enter an assignment name.');
    if (questions.some(q => !q.text.trim() && q.subParts.length === 0))
      return setErrMsg('All questions must have text or at least one sub-question.');

    setSaving(true);
    setErrMsg(null);
    try {
      // 1. Create the paper (blank upload)
      const fd = new FormData();
      const blankBlob = new Blob([''], { type: 'application/pdf' });
      fd.append('file', blankBlob, `${assignmentName.trim()}.pdf`);
      fd.append('exam_id', '1');
      fd.append('notes', 'created from scratch');

      const createRes = await fetch('/api/upload-paper', { method: 'POST', body: fd });
      const createData = await createRes.json().catch(() => null);
      if (!createRes.ok) throw new Error(extractMsg(createData, 'Failed to create assignment'));

      const paperId = Number(createData?.paper_id);
      if (!paperId) throw new Error('No paper ID returned');

      // 2. Save the name locally
      const stored = JSON.parse(localStorage.getItem('paperFileNames') ?? '{}');
      stored[String(paperId)] = assignmentName.trim();
      localStorage.setItem('paperFileNames', JSON.stringify(stored));

      // 3. Add each question
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qId = String(i + 1);
        const parts = q.subParts.map((sp, si) => ({
          canonical_question_id: `${qId}.${String.fromCharCode(97 + si)}`,
          display_label: sp.label || `Q${qId}(${String.fromCharCode(97 + si)})`,
          max_marks: sp.max_marks,
          question_content: { text: sp.text },
        }));
        const payload = {
          paper_id: paperId,
          canonical_question_id: qId,
          display_label: `Q${qId}`,
          max_marks: q.max_marks,
          question_content: { text: q.text },
          parts,
        };
        const qRes = await fetch('/api/qh/add-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const qData = await qRes.json().catch(() => null);
        if (!qRes.ok) throw new Error(extractMsg(qData, `Failed to save question ${i + 1}`));
      }

      onCreated(paperId, assignmentName.trim());
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 pointer-events-none overflow-y-auto">
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col mb-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
            <div>
              <p className="font-semibold text-slate-900">Create Assignment from Scratch</p>
              <p className="text-xs text-slate-500 mt-0.5">Define questions manually — no file needed</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-6 overflow-y-auto">
            {/* Assignment name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Assignment name</label>
              <input
                type="text"
                value={assignmentName}
                onChange={e => setAssignmentName(e.target.value)}
                placeholder="e.g. Week 3 — Cybersecurity Governance"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Questions</p>
                <button type="button" onClick={addQuestion}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
                  <Plus className="h-3 w-3" /> Add question
                </button>
              </div>

              {questions.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  {/* Question header */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                      {qi + 1}
                    </span>
                    <input
                      type="text"
                      value={q.text}
                      onChange={e => updateQuestion(qi, 'text', e.target.value)}
                      placeholder="Question text…"
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    />
                    <input
                      type="number" min={0} step={0.5}
                      value={q.max_marks}
                      onChange={e => updateQuestion(qi, 'max_marks', Number(e.target.value))}
                      placeholder="Marks"
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-slate-400"
                    />
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)}
                        className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Sub-parts */}
                  {q.subParts.length > 0 && (
                    <div className="space-y-2 ml-8">
                      {q.subParts.map((sp, si) => (
                        <div key={si} className="flex items-center gap-2">
                          <input value={sp.label} onChange={e => updateSubPart(qi, si, 'label', e.target.value)}
                            placeholder={`Label (e.g. (a))`}
                            className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-slate-400" />
                          <input value={sp.text} onChange={e => updateSubPart(qi, si, 'text', e.target.value)}
                            placeholder="Sub-question text…"
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-slate-400" />
                          <input type="number" min={0} step={0.5} value={sp.max_marks}
                            onChange={e => updateSubPart(qi, si, 'max_marks', Number(e.target.value))}
                            placeholder="Marks"
                            className="w-16 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-slate-400" />
                          <button type="button" onClick={() => removeSubPart(qi, si)}
                            className="rounded-lg p-1 text-slate-300 hover:text-rose-500 transition">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={() => addSubPart(qi)}
                    className="ml-8 inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-400 hover:border-slate-400 hover:text-slate-600 transition">
                    <Plus className="h-3 w-3" /> Add sub-question
                  </button>
                </div>
              ))}
            </div>

            {errMsg && <p className="text-sm text-rose-600">{errMsg}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
            <button type="button" disabled={saving} onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Creating…' : 'Create Assignment'}
            </button>
            <button type="button" onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PapersPage() {
  const router = useRouter();
  const [papers, setPapers] = React.useState<Paper[]>([]);
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [loadingPapers, setLoadingPapers] = React.useState(true);
  const [fileNames, setFileNames] = React.useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const pollingRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = React.useRef(false);
  const paperBlobUrls = React.useRef<Map<number, string>>(new Map());

  React.useEffect(() => {
    const map = paperBlobUrls.current;
    return () => { map.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  const [detailPaper, setDetailPaper] = React.useState<Paper | null>(null);
  const [renamingId, setRenamingId] = React.useState<number | null>(null);
  const [renameValue, setRenameValue] = React.useState('');

  const openDetail = React.useCallback((paper: Paper) => { setDetailPaper(paper); }, []);

  const startRename = React.useCallback((paper: Paper, currentName: string) => {
    setRenamingId(paper.paper_id);
    setRenameValue(currentName);
  }, []);

  const commitRename = React.useCallback((paperId: number) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      const stored = JSON.parse(localStorage.getItem('paperFileNames') ?? '{}');
      stored[String(paperId)] = trimmed;
      localStorage.setItem('paperFileNames', JSON.stringify(stored));
      setFileNames({ ...stored });
    }
    setRenamingId(null);
  }, [renameValue]);

  React.useEffect(() => {
    setFileNames(JSON.parse(localStorage.getItem('paperFileNames') ?? '{}'));
  }, []);

  const stopPolling = React.useCallback(() => {
    isPollingRef.current = false;
    if (pollingRef.current) { clearTimeout(pollingRef.current); pollingRef.current = null; }
  }, []);

  const scheduleNextPoll = React.useCallback((delay: number) => {
    if (!isPollingRef.current) return;
    pollingRef.current = setTimeout(async () => {
      if (!isPollingRef.current) return;
      try {
        const res = await fetch('/api/list-paper', { cache: 'no-store' });
        if (res.status === 429) { scheduleNextPoll(Math.min(delay * 2, 60_000)); return; }
        if (!res.ok) { scheduleNextPoll(delay); return; }
        const data = await res.json();
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
          : [];
        setPapers(sorted);
        const hasPending = sorted.some(
          (p) => p.validation_status !== 'SUCCESS' && p.validation_status !== 'FAILED'
        );
        if (hasPending) scheduleNextPoll(delay); else stopPolling();
      } catch { scheduleNextPoll(delay); }
    }, delay);
  }, [stopPolling]);

  const startPolling = React.useCallback(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    scheduleNextPoll(10_000);
  }, [scheduleNextPoll]);

  React.useEffect(() => stopPolling, [stopPolling]);

  const fetchPapers = React.useCallback(async () => {
    try {
      setLoadingPapers(true);
      let res!: Response;
      let data: unknown = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        res = await fetch('/api/list-paper', { cache: 'no-store' });
        data = await res.json().catch(() => null);
        if (res.status === 401) { router.replace('/signin'); return; }
        if (res.status !== 429) break;
        const m = (data as { message?: string })?.message?.match(/(\d+)\s*second/);
        await new Promise((r) => setTimeout(r, m ? parseInt(m[1]) * 1000 : 5000));
      }
      if (!res.ok) { setPapers([]); return; }
      const list: Paper[] = Array.isArray(data) ? data
        : ((data as Record<string, unknown>)?.papers as Paper[]) ?? [];
      const sorted = [...list].sort(
        (a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()
      );
      setPapers(sorted);
    } catch { setPapers([]); }
    finally { setLoadingPapers(false); }
  }, [router]);

  React.useEffect(() => { fetchPapers(); }, [fetchPapers]);

  const simulateUpload = React.useCallback(async (newFiles: File[]) => {
    const mapped: UploadFile[] = newFiles.map((file, i) => ({ id: Date.now() + i, file, progress: 0, uploaded: false }));
    setFiles((prev) => [...mapped, ...prev]);

    for (const uf of mapped) {
      let progress = 0;
      const ticker = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, progress: Math.min(progress, 90) } : f));
      }, 200);

      try {
        const fd = new FormData();
        fd.append('file', uf.file);
        fd.append('exam_id', '1');
        fd.append('notes', 'upload from web');

        let res!: Response;
        let data: Record<string, unknown> | null = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          res = await fetch('/api/upload-paper', { method: 'POST', body: fd });
          data = await res.json().catch(() => null);
          if (res.status !== 429) break;
          const m = (data?.message as string)?.match(/(\d+)\s*second/);
          await new Promise((r) => setTimeout(r, m ? parseInt(m[1]) * 1000 : 5000));
        }
        clearInterval(ticker);
        if (!res.ok) throw new Error((data?.message as string) ?? 'Upload failed');

        setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, progress: 100, uploaded: true } : f));

        if (data?.paper_id) {
          const pid = Number(data.paper_id);
          const old = paperBlobUrls.current.get(pid);
          if (old) URL.revokeObjectURL(old);
          paperBlobUrls.current.set(pid, URL.createObjectURL(uf.file));

          const stored = JSON.parse(localStorage.getItem('paperFileNames') ?? '{}');
          stored[String(data.paper_id)] = uf.file.name;
          localStorage.setItem('paperFileNames', JSON.stringify(stored));
          setFileNames({ ...stored });
        }
        await fetchPapers();
        startPolling();
      } catch (err) {
        clearInterval(ticker);
        setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, progress: 0, error: err instanceof Error ? err.message : 'Upload failed' } : f));
      }
    }
  }, [fetchPapers, startPolling]);

  const handleFiles = React.useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;
    simulateUpload(Array.from(list).slice(0, 10));
  }, [simulateUpload]);

  const deletePaper = async (paperId: number) => {
    try {
      const res = await fetch(`/api/delete-paper?paper_id=${paperId}`, { method: 'DELETE' });
      if (!res.ok) return;
      setPapers((prev) => prev.filter((p) => p.paper_id !== paperId));
      const stored = JSON.parse(localStorage.getItem('paperFileNames') ?? '{}');
      delete stored[paperId];
      localStorage.setItem('paperFileNames', JSON.stringify(stored));
      setFileNames({ ...stored });
    } catch { /* ignore */ }
  };

  const successCount = papers.filter((p) => normalizeStatus(p.validation_status) === 'SUCCESS').length;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <Navbar variant="light"/>
      <div className="px-6 py-8 md:px-10 space-y-8">

        {/* Page title */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Papers</h1>
            <p className="mt-1 text-sm text-slate-500">
              Upload assignment briefs/exam papers, set up rubrics, and grade student submissions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Create from scratch
          </button>
        </div>

        {/* Upload zone */}
        <div data-guide="papers-upload">
          <label
            htmlFor="paper-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 ${
              isDragging ? 'border-slate-400 bg-white' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Upload className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Drop your assignment brief/exam paper here</p>
                <p className="mt-0.5 text-xs text-slate-500">PDF, DOC or DOCX · up to 5 MB each · max 10 files</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); inputRef.current?.click(); }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Browse files
              </button>
            </div>
            <input id="paper-upload" ref={inputRef} type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </label>

          {/* Upload progress */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                    <CircleProgress progress={item.progress} />
                    <Upload className="absolute h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{item.file.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.error ? (
                        <span className="text-rose-500">{item.error}</span>
                      ) : item.progress < 100 ? `Uploading ${item.progress}%` : 'Upload complete'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setFiles((p) => p.filter((f) => f.id !== item.id))} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Papers list */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Uploaded Papers</h2>
              <p className="text-xs text-slate-400">{papers.length} total · {successCount} ready</p>
            </div>
            <button onClick={fetchPapers} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
              Refresh
            </button>
          </div>

          {loadingPapers ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
              <p className="text-sm">Loading papers…</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <BookOpen className="mb-3 h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">No papers yet</p>
              <p className="text-xs text-slate-400">Upload your first exam paper above</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {papers.map((paper) => {
                const norm = normalizeStatus(paper.validation_status);
                const isReady = norm === 'SUCCESS';
                const name = fileNames[paper.paper_id] ?? `Paper #${paper.paper_id}`;
                return (
                  <div key={paper.paper_id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {renamingId === paper.paper_id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => commitRename(paper.paper_id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(paper.paper_id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="truncate text-sm font-semibold text-slate-900 rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
                            style={{ minWidth: 0, width: '100%', maxWidth: 280 }}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => startRename(paper, name)}
                            title="Rename paper"
                            className="group flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900 hover:text-slate-600"
                          >
                            <span className="truncate">{name}</span>
                            <Pencil className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                          </button>
                        )}
                        <span className="text-xs text-slate-400">#{paper.paper_id}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                        {paper.created_at && (
                          <span>{new Date(paper.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                        {paper.total_marks != null && <span>{paper.total_marks} marks</span>}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          <Clock3 className="h-3.5 w-3.5" /> Processing
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDetail(paper)}
                        title="View detail"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/papers/${paper.paper_id}/setup`)}
                        data-guide="papers-setup"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Setup
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/papers/${paper.paper_id}/grade`)}
                        disabled={!isReady}
                        data-guide="papers-grade"
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition ${
                          isReady
                            ? 'bg-slate-900 text-white hover:bg-slate-700'
                            : 'cursor-not-allowed bg-slate-100 text-slate-400'
                        }`}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        Grade
                        {isReady && <ArrowRight className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePaper(paper.paper_id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PDF preview modal */}
      {detailPaper && (() => {
        const blobUrl = paperBlobUrls.current.get(detailPaper.paper_id) ?? null;
        const pdfSrc = blobUrl ?? `/api/paper-file?paper_id=${detailPaper.paper_id}`;
        const isReady = normalizeStatus(detailPaper.validation_status) === 'SUCCESS';

        return (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setDetailPaper(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto flex w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl"
                style={{ height: 'min(92vh, 900px)' }}>
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {fileNames[detailPaper.paper_id] ?? `Paper #${detailPaper.paper_id}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>#{detailPaper.paper_id}</span>
                        {detailPaper.created_at && (
                          <><span>·</span><span>{new Date(detailPaper.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></>
                        )}
                        {detailPaper.total_marks != null && (
                          <><span>·</span><span>{detailPaper.total_marks} marks</span></>
                        )}
                        <span>·</span>
                        {isReady
                          ? <span className="font-medium text-emerald-600">Ready</span>
                          : <span className="font-medium text-amber-500">Processing</span>
                        }
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setDetailPaper(null)}
                    className="ml-4 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <iframe src={pdfSrc} className="min-h-0 flex-1 w-full rounded-none border-0" title="Paper PDF preview" />
                <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 px-5 py-3.5">
                  <button type="button"
                    onClick={() => { setDetailPaper(null); router.push(`/papers/${detailPaper.paper_id}/setup`); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <Settings className="h-3.5 w-3.5" /> Setup
                  </button>
                  <button type="button" disabled={!isReady}
                    onClick={() => { setDetailPaper(null); router.push(`/papers/${detailPaper.paper_id}/grade`); }}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium shadow-sm transition ${
                      isReady ? 'bg-slate-900 text-white hover:bg-slate-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'
                    }`}>
                    <GraduationCap className="h-3.5 w-3.5" /> Grade
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Create from scratch modal */}
      {showCreateModal && (
        <CreateFromScratchModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(paperId, name) => {
            setShowCreateModal(false);
            fetchPapers();
            router.push(`/papers/${paperId}/setup`);
          }}
        />
      )}
    </main>
  );
}