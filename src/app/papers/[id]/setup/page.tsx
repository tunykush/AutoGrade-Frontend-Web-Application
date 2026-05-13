'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Upload, Loader2, Lock, BookOpen, ChevronRight,
  CheckCircle2, AlertCircle, Pencil, X, Plus, Trash2,
} from 'lucide-react';
import { normalizeStatus, isTerminal, isActive, StatusBadge } from '@/components/papers/StatusBadge';
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

function bandColor(levelStr: string): { pill: string; border: string } {
  const n = parseInt(levelStr.match(/\d+/)?.[0] ?? '0', 10);
  if (n >= 5) return { pill: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200 bg-emerald-50' };
  if (n === 4) return { pill: 'bg-blue-100 text-blue-800', border: 'border-blue-200 bg-blue-50' };
  if (n === 3) return { pill: 'bg-amber-100 text-amber-800', border: 'border-amber-200 bg-amber-50' };
  if (n === 2) return { pill: 'bg-orange-100 text-orange-800', border: 'border-orange-200 bg-orange-50' };
  return { pill: 'bg-rose-100 text-rose-800', border: 'border-rose-200 bg-rose-50' };
}

export default function SetupPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = Number(params.id);
  const [paperName, setPaperName] = React.useState<string>(`Paper #${paperId}`);

  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('paperFileNames') ?? '{}');
    if (stored[paperId]) setPaperName(stored[paperId]);
  }, [paperId]);

  // ── Paper status ───────────────────────────────────────────────────────────
  const [paperStatus, setPaperStatus] = React.useState<string>('PENDING');
  const [paperFinalized, setPaperFinalized] = React.useState(false);
  const paperPollRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/paper-status?paper_id=${paperId}`, { cache: 'no-store' });
        const d = await res.json().catch(() => null);
        const raw = d?.validation_status ?? d?.ingestion_status ?? d?.status ?? '';
        const s = normalizeStatus(raw);
        if (!cancelled) {
          setPaperStatus(s);
          if (d?.is_finalized) setPaperFinalized(true);
          if (s !== 'SUCCESS') paperPollRef.current = setTimeout(poll, 8_000);
        }
      } catch {
        if (!cancelled) paperPollRef.current = setTimeout(poll, 8_000);
      }
    };
    poll();
    return () => { cancelled = true; if (paperPollRef.current) clearTimeout(paperPollRef.current); };
  }, [paperId]);

  // ── Extracted Questions (master_json) ────────────────────────────────────
  const [masterData, setMasterData] = React.useState<Record<string, unknown> | null>(null);
  const [masterLoading, setMasterLoading] = React.useState(false);

  React.useEffect(() => {
    if (paperStatus !== 'SUCCESS') return;
    let cancelled = false;
    setMasterLoading(true);
    fetch(`/api/qh/master-json?paper_id=${paperId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) setMasterData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMasterLoading(false); });
    return () => { cancelled = true; };
  }, [paperId, paperStatus]);

  type QRec = Record<string, unknown>;

  const examMeta = React.useMemo(() => {
    if (!masterData) return null;
    const meta = (masterData as QRec).exam_meta;
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) return meta as QRec;
    return null;
  }, [masterData]);

  const masterEntries: [string, QRec][] = React.useMemo(() => {
    if (!masterData) return [];
    const raw = Array.isArray((masterData as QRec).questions)
      ? ((masterData as QRec).questions as unknown[])
      : Array.isArray(masterData)
      ? (masterData as unknown[])
      : [];
    return (raw as QRec[])
      .filter(q => q && typeof q === 'object' && q.canonical_question_id != null)
      .map(q => [String(q.display_label ?? q.canonical_question_id), q]);
  }, [masterData]);

  // ── Rubric ────────────────────────────────────────────────────────────────
  const [rubricStatus, setRubricStatus] = React.useState<string | null>(null);
  const [rubricChecking, setRubricChecking] = React.useState(true);
  const [rubricCreating, setRubricCreating] = React.useState(false);
  const [rubricFinalizing, setRubricFinalizing] = React.useState(false);
  const [rubricMsg, setRubricMsg] = React.useState<{ ok: boolean; warn?: boolean; text: string } | null>(null);
  const rubricSseRef = React.useRef<EventSource | null>(null);

  const startRubricSSE = React.useCallback(() => {
    rubricSseRef.current?.close();
    const es = new EventSource(`/api/rh/status?paper_id=${paperId}&stream=true`);
    rubricSseRef.current = es;
    es.onmessage = (evt) => {
      try {
        const d = JSON.parse(evt.data);
        const raw = d.status ?? d.validation_status ?? d.rubric_status ?? d.state ?? '';
        const s = normalizeStatus(raw);
        setRubricStatus(s);
        if (isTerminal(s)) { es.close(); rubricSseRef.current = null; }
      } catch { /* ignore */ }
    };
    es.onerror = () => { es.close(); rubricSseRef.current = null; };
  }, [paperId]);

  // Load existing rubric status on mount
  React.useEffect(() => {
    let cancelled = false;
    setRubricChecking(true);
    (async () => {
      try {
        const res = await fetch(`/api/rh/status?paper_id=${paperId}`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const d = await res.json().catch(() => null);
          if (d && !cancelled) {
            const raw = String(d.status ?? d.validation_status ?? d.rubric_status ?? d.state ?? '').toUpperCase();
            // NOT_STARTED (and variants) means the rubric hasn't been created yet.
            // Leave rubricStatus as null so the "Create Rubric" button is shown.
            const notYetCreated = !raw || ['NOT_STARTED', 'NOT_YET_STARTED', 'NONE', 'UNSTARTED'].includes(raw);
            if (!notYetCreated) {
              const s = normalizeStatus(raw);
              if (s) {
                setRubricStatus(s);
                if (s !== 'FAILED') setPaperFinalized(true);
                if (isActive(s)) startRubricSSE();
              }
            }
          }
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setRubricChecking(false); }
    })();
    return () => {
      cancelled = true;
      rubricSseRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  const createRubric = async () => {
    setRubricCreating(true);
    setRubricMsg(null);
    try {
      if (!paperFinalized) {
        const fRes = await fetch('/api/qh/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paper_id: paperId }),
        });
        if (!fRes.ok) {
          const fd = await fRes.json().catch(() => null);
          throw new Error(fd?.error ?? fd?.message ?? 'Paper finalization failed');
        }
        setPaperFinalized(true);
      }
      const res = await fetch('/api/rh/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: paperId }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 412) {
        setRubricMsg({ ok: false, warn: true, text: 'Paper is still being ingested. Please wait 1–2 minutes and try again.' });
        return;
      }
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Create failed');
      setRubricStatus('PENDING');
      startRubricSSE();
    } catch (err) {
      setRubricMsg({ ok: false, text: err instanceof Error ? err.message : 'Create failed' });
    } finally {
      setRubricCreating(false);
    }
  };


  const finalizeRubric = async () => {
    setRubricFinalizing(true);
    setRubricMsg(null);
    try {
      const res = await fetch('/api/rh/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: paperId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(extractMsg(data, 'Finalize failed'));
      setRubricStatus('FINALIZED');
      setRubricMsg({ ok: true, text: 'Rubric finalized.' });
    } catch (err) {
      setRubricMsg({ ok: false, text: err instanceof Error ? err.message : 'Finalize failed' });
    } finally {
      setRubricFinalizing(false);
    }
  };

  // ── Inline question editing ───────────────────────────────────────────────
  const [editingQId, setEditingQId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<{ text: string; max_marks: number }>({ text: '', max_marks: 0 });
  const [editSaving, setEditSaving] = React.useState(false);
  const [editMsg, setEditMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const saveQuestion = async (originalQ: QRec) => {
    setEditSaving(true);
    setEditMsg(null);
    try {
      const res = await fetch('/api/qh/add-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: paperId,
          ...originalQ,
          max_marks: editDraft.max_marks,
          question_content: { text: editDraft.text },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Save failed');
      // Update local display state
      setMasterData(prev => {
        if (!prev) return prev;
        const qs = Array.isArray((prev as QRec).questions) ? [...((prev as QRec).questions as QRec[])] : null;
        if (!qs) return prev;
        const idx = qs.findIndex(q => (q as QRec).canonical_question_id === originalQ.canonical_question_id);
        if (idx >= 0) qs[idx] = { ...(qs[idx] as QRec), max_marks: editDraft.max_marks, question_content: { text: editDraft.text } };
        return { ...(prev as QRec), questions: qs } as Record<string, unknown>;
      });
      setEditingQId(null);
    } catch (err) {
      setEditMsg({ ok: false, text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setEditSaving(false);
    }
  };

  // ── Auto-resize textarea helper ───────────────────────────────────────────
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // ── Rubric inline editing state ───────────────────────────────────────────
  type PerfLevel = { level: string; description: string; score_range?: string; threshold?: string };
  type Deduction = { reason: string; penalty: number };
  type RubricDraft = { perfLevels: PerfLevel[]; deductions: Deduction[] };
  const [editingRubricId, setEditingRubricId] = React.useState<string | null>(null);
  const [rubricDraft, setRubricDraft] = React.useState<RubricDraft>({ perfLevels: [], deductions: [] });
  const [rubricSaving, setRubricSaving] = React.useState(false);
  const [rubricEditMsg, setRubricEditMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const saveRubricEdits = async (q: QRec, partId?: string) => {
    setRubricSaving(true);
    setRubricEditMsg(null);
    try {
      const payload = partId
        ? { paper_id: paperId, canonical_question_id: partId, rubric: { performance_levels: rubricDraft.perfLevels, deductions: rubricDraft.deductions } }
        : { paper_id: paperId, ...q, rubric: { performance_levels: rubricDraft.perfLevels, deductions: rubricDraft.deductions } };
      const res = await fetch('/api/rh/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Save failed');
      setMasterData(prev => {
        if (!prev) return prev;
        const qs = Array.isArray((prev as QRec).questions) ? [...((prev as QRec).questions as QRec[])] : null;
        if (!qs) return prev;
        if (partId) {
          const qi = qs.findIndex(q2 => Array.isArray((q2 as QRec).parts) && ((q2 as QRec).parts as QRec[]).some(p => String(p.canonical_question_id) === partId));
          if (qi >= 0) {
            const parts = [...((qs[qi] as QRec).parts as QRec[])];
            const pi = parts.findIndex(p => String(p.canonical_question_id) === partId);
            if (pi >= 0) parts[pi] = { ...parts[pi], rubric: { performance_levels: rubricDraft.perfLevels, deductions: rubricDraft.deductions } };
            qs[qi] = { ...qs[qi], parts };
          }
        } else {
          const qi = qs.findIndex(q2 => (q2 as QRec).canonical_question_id === q.canonical_question_id);
          if (qi >= 0) qs[qi] = { ...qs[qi], rubric: { performance_levels: rubricDraft.perfLevels, deductions: rubricDraft.deductions } };
        }
        return { ...(prev as QRec), questions: qs } as Record<string, unknown>;
      });
      setEditingRubricId(null);
    } catch (err) {
      setRubricEditMsg({ ok: false, text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setRubricSaving(false);
    }
  };

  const startEditRubric = (id: string, perfLevels: QRec[], deductions: QRec[]) => {
    setEditingRubricId(id);
    setRubricDraft({
      perfLevels: perfLevels.map(l => ({ level: String(l.level ?? ''), description: String(l.description ?? ''), score_range: l.score_range != null ? String(l.score_range) : undefined, threshold: l.threshold != null ? String(l.threshold) : undefined })),
      deductions: deductions.map(d => ({ reason: String(d.reason ?? ''), penalty: Number(d.penalty ?? 0) })),
    });
    setRubricEditMsg(null);
  };

    // ── Sample Answer ─────────────────────────────────────────────────────────
  const [shPaperId, setShPaperId] = React.useState<number | null>(null);
  const [shFileName, setShFileName] = React.useState<string | null>(null);
  const [shStatus, setShStatus] = React.useState<string | null>(null);
  const [shUploading, setShUploading] = React.useState(false);
  const [shFinalizing, setShFinalizing] = React.useState(false);
  const [shMsg, setShMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const shFileRef = React.useRef<HTMLInputElement | null>(null);
  // Generation counter — increment to cancel all previous polling loops
  const shPollGenRef = React.useRef(0);

  const pollShStatus = React.useCallback((id: number) => {
    const gen = ++shPollGenRef.current;
    let notFoundRetries = 0;
    const poll = async () => {
      if (gen !== shPollGenRef.current) return;
      try {
        const r = await fetch(`/api/sh/status?paper_id=${id}`, { cache: 'no-store' });
        const d = await r.json().catch(() => null);
        if (gen !== shPollGenRef.current) return;
        if (!r.ok) {
          if (r.status === 404 && notFoundRetries < 6) {
            // Backend may not have registered the record yet — keep retrying
            notFoundRetries++;
            setTimeout(poll, 12_000);
          } else if (r.status !== 404) {
            // Other error (auth, server error) — retry normally
            setTimeout(poll, 8_000);
          }
          // 404 exhausted — stop silently
          return;
        }
        notFoundRetries = 0;
        const raw =
          d?.status ??
          d?.validation_status ??
          d?.ingestion_status ??
          d?.sample_status ??
          d?.state ??
          '';
        const s = normalizeStatus(raw);
        if (s) setShStatus(s);
        if (!isTerminal(s)) setTimeout(poll, 6_000);
      } catch { if (gen === shPollGenRef.current) setTimeout(poll, 8_000); }
    };
    poll();
  }, []);

  // Load persisted sample answer and fetch current status on mount
  React.useEffect(() => {
    let cancelled = false;

    // Restore from localStorage immediately so UI doesn't flicker
    const storedId = localStorage.getItem(`shId_${paperId}`);
    const storedName = localStorage.getItem(`shName_${paperId}`);
    if (storedName) setShFileName(storedName);

    (async () => {
      // 1. Try fetching from API to get latest status
      try {
        const res = await fetch(`/api/sh/get?paper_id=${paperId}`, { cache: 'no-store' });
        if (!cancelled && res.ok) {
          const d = await res.json().catch(() => null);
          const raw =
            d?.status ??
            d?.validation_status ??
            d?.ingestion_status ??
            d?.sample_status ??
            d?.state ??
            '';
          const s = normalizeStatus(raw);
          const shId: number = d?.sh_id ?? d?.paper_id ?? d?.id ?? paperId;
          if (!cancelled) {
            setShPaperId(shId);
            if (s) setShStatus(s);
            // Poll if not in terminal state
            if (!isTerminal(s)) pollShStatus(paperId);
          }
          return;
        }
      } catch { /* fall through */ }

      // 2. API returned 404 or errored — if we have a stored file, start polling anyway
      // The status endpoint is independent and may still have data
      if (cancelled) return;
      if (storedId) {
        const storedNum = Number(storedId);
        if (storedNum) setShPaperId(storedNum);
      }
      // Always poll if we know a file was previously uploaded
      if (storedName) pollShStatus(paperId);
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  const uploadSampleAnswer = async (file: File) => {
    // Cancel any in-flight status polling from a previous upload
    shPollGenRef.current += 1;
    setShUploading(true);
    setShMsg(null);
    setShStatus(null); // clear stale status so UI resets cleanly
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('paper_id', String(paperId));
      // sh service uses its own exam registry (separate from qh service).
      // exam_id=1 is the valid exam in sh service — do NOT use paper_id or qh exam_id here.
      fd.append('exam_id', '1');
      const res = await fetch('/api/sh/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(extractMsg(data, 'Upload failed'));
      const shId: number = data?.sh_id ?? data?.paper_id ?? data?.id ?? paperId;
      setShPaperId(shId || paperId);
      setShStatus('PENDING');
      setShFileName(file.name);
      localStorage.setItem(`shId_${paperId}`, String(shId || paperId));
      localStorage.setItem(`shName_${paperId}`, file.name);
      // Start polling immediately — backend processes asynchronously
      pollShStatus(paperId);
      setShMsg({ ok: true, text: 'Sample answer uploaded successfully.' });
    } catch (err) {
      setShMsg({ ok: false, text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setShUploading(false);
    }
  };

  const finalizeSampleAnswer = async () => {
    if (!shPaperId) return;
    setShFinalizing(true);
    setShMsg(null);
    try {
      const res = await fetch('/api/sh/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: shPaperId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(extractMsg(data, 'Finalize failed'));
      setShStatus('FINALIZED');
      setShMsg({ ok: true, text: 'Sample answer finalized.' });
    } catch (err) {
      setShMsg({ ok: false, text: err instanceof Error ? err.message : 'Finalize failed' });
    } finally {
      setShFinalizing(false);
    }
  };

  const rubricFinalized = rubricStatus === 'FINALIZED';
  const rubricReady = rubricStatus === 'SUCCESS' || rubricFinalized;
  const rubricActive = rubricStatus === 'PENDING' || rubricStatus === 'RUNNING';

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <Navbar variant="light"/>
      <div className="px-6 py-8 md:px-10 space-y-6">

        {/* Breadcrumb + header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/papers')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 hover:bg-white hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Papers
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-700 truncate">{paperName}</span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-900">Setup</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Paper Setup</h1>
            <p className="mt-0.5 text-sm text-slate-500">Configure rubric and sample answer before grading</p>
          </div>
          {/* Paper status chip */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            paperStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {paperStatus === 'SUCCESS'
              ? <><CheckCircle2 className="h-3.5 w-3.5" /> Paper Ready</>
              : <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</>
            }
          </span>
        </div>

        {/* Two-column grid: questions left, controls right */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_400px]">

        {/* Step 1: Extracted Questions */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              masterEntries.length > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
            }`}>
              {masterEntries.length > 0 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">Extracted Questions</p>
              <p className="text-xs text-slate-500">AI-parsed content from your paper · review before creating rubric</p>
            </div>
            {examMeta && (
              <div className="flex shrink-0 items-center gap-2">
                {typeof examMeta.total_marks === 'number' && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {examMeta.total_marks} marks total
                  </span>
                )}
                {typeof examMeta.duration_minutes === 'number' && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {examMeta.duration_minutes} min
                  </span>
                )}
              </div>
            )}
          </div>

          {paperStatus !== 'SUCCESS' ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Waiting for paper to finish processing…</p>
            </div>
          ) : masterLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Loading questions…</p>
            </div>
          ) : masterEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">No questions found in this paper.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {masterEntries.map(([label, q], idx) => {
                const qc = q.question_content as QRec | null;
                const sc = q.sample_content as QRec | null;
                const rubric = q.rubric as QRec | null;
                const perfLevels = Array.isArray(rubric?.performance_levels) ? rubric!.performance_levels as QRec[] : [];
                const deductions = Array.isArray(rubric?.deductions) ? rubric!.deductions as QRec[] : [];
                const subParts = Array.isArray(q.parts)
                  ? (q.parts as QRec[]).filter(p => p.canonical_question_id != null)
                  : [];
                const questionText = typeof qc?.text === 'string' ? qc.text : null;
                const sampleText = typeof sc?.text === 'string' ? sc.text : null;
                const marks = q.max_marks ?? q.marks ?? null;
                const hasOwnRubric = subParts.length === 0;

                const isEditing = editingQId === label;

                return (
                  <div key={label} className="px-5 py-5 space-y-4">
                    {/* Question header */}
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Label row + action buttons */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={editSaving}
                                onClick={() => saveQuestion(q)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditingQId(null); setEditMsg(null); }}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQId(label);
                                setEditDraft({ text: questionText ?? '', max_marks: Number(marks ?? 0) });
                                setEditMsg(null);
                              }}
                              className="rounded-lg p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition"
                              title="Edit question"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Edit form or display */}
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editDraft.text}
                              onChange={e => { setEditDraft(d => ({ ...d, text: e.target.value })); }}
                              rows={3}
                             
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                              placeholder="Question text…"
                            />
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-slate-500 shrink-0">Max marks</label>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={editDraft.max_marks}
                                onChange={e => setEditDraft(d => ({ ...d, max_marks: Number(e.target.value) }))}
                                className="w-20 rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                              />
                            </div>
                            {editMsg && (
                              <p className={`text-xs ${editMsg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{editMsg.text}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {questionText
                                ? <p className="text-sm font-medium text-slate-800 leading-relaxed">{questionText}</p>
                                : subParts.length === 0 && <p className="text-sm text-slate-500 italic">No question text</p>
                              }
                            </div>
                            {marks != null && (
                              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {String(marks)} marks
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sub-parts */}
                    {subParts.map((part, pi) => {
                      const pqc = part.question_content as QRec | null;
                      const psc = part.sample_content as QRec | null;
                      const prubric = part.rubric as QRec | null;
                      const pPerf = Array.isArray(prubric?.performance_levels) ? prubric!.performance_levels as QRec[] : [];
                      const pDed = Array.isArray(prubric?.deductions) ? prubric!.deductions as QRec[] : [];
                      const pText = typeof pqc?.text === 'string' ? pqc.text : null;
                      const pSample = typeof psc?.text === 'string' ? psc.text : null;
                      const pMarks = part.max_marks ?? part.marks ?? null;
                      const pLabel = String(part.display_label ?? part.canonical_question_id ?? `Part ${pi + 1}`);
                      return (
                        <div key={pLabel} className="ml-10 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{pLabel}</p>
                              {pText
                                ? <p className="text-sm font-medium text-slate-800 leading-relaxed">{pText}</p>
                                : <p className="text-sm text-slate-500 italic">No question text</p>
                              }
                            </div>
                            {pMarks != null && (
                              <span className="shrink-0 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                {String(pMarks)} marks
                              </span>
                            )}
                          </div>

                        {/* Rubric Editor Component */}
                        {(() => {
                          const rubricId = String(part.canonical_question_id ?? pLabel);
                          const isEditingRubric = editingRubricId === rubricId;
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rubric</p>
                                {!isEditingRubric ? (
                                  <button type="button" onClick={() => startEditRubric(rubricId, pPerf, pDed)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                                    <Pencil className="h-3 w-3" /> Edit
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button type="button" disabled={rubricSaving} onClick={() => saveRubricEdits(q, String(part.canonical_question_id))}
                                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60">
                                      {rubricSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} Save
                                    </button>
                                    <button type="button" onClick={() => { setEditingRubricId(null); setRubricEditMsg(null); }}
                                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {isEditingRubric ? (
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Performance Levels</p>
                                    {rubricDraft.perfLevels.map((lv, li) => {
                                      const { border } = bandColor(lv.level);
                                      return (
                                        <div key={li} className={`rounded-xl border p-3 space-y-2 ${border}`}>
                                          <div className="flex items-center gap-2">
                                            <input value={lv.level} onChange={e => setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], level: e.target.value}; return {...d, perfLevels: pl}; })}
                                              className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-400" placeholder="Band label" />
                                            <input value={lv.score_range ?? ''} onChange={e => setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], score_range: e.target.value}; return {...d, perfLevels: pl}; })}
                                              className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-400" placeholder="Score range" />
                                            <input value={lv.threshold ?? ''} onChange={e => setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], threshold: e.target.value}; return {...d, perfLevels: pl}; })}
                                              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-400" placeholder="Threshold" />
                                            <button type="button" onClick={() => setRubricDraft(d => { const pl = d.perfLevels.filter((_, i) => i !== li); return {...d, perfLevels: pl}; })}
                                              className="ml-auto rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                          </div>
                                          <textarea value={lv.description} onChange={e => { setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], description: e.target.value}; return {...d, perfLevels: pl}; }); }}
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-slate-400" placeholder="Description…" />
                                        </div>
                                      );
                                    })}
                                    <button type="button" onClick={() => setRubricDraft(d => ({...d, perfLevels: [...d.perfLevels, {level: `Band ${d.perfLevels.length + 1}`, description: '', score_range: '', threshold: ''}]}))}
                                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700 transition">
                                      <Plus className="h-3 w-3" /> Add Level
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Deductions</p>
                                    {rubricDraft.deductions.map((ded, di) => (
                                      <div key={di} className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                                        <textarea value={ded.reason} onChange={e => { setRubricDraft(d => { const dd = [...d.deductions]; dd[di] = {...dd[di], reason: e.target.value}; return {...d, deductions: dd}; }); }}
                                          rows={1}
                                          className="flex-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs outline-none focus:border-rose-400" placeholder="Deduction reason…" />
                                        <input type="number" step={0.5} value={ded.penalty} onChange={e => setRubricDraft(d => { const dd = [...d.deductions]; dd[di] = {...dd[di], penalty: Number(e.target.value)}; return {...d, deductions: dd}; })}
                                          className="w-16 rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs outline-none focus:border-rose-400" placeholder="−pts" />
                                        <button type="button" onClick={() => setRubricDraft(d => ({ ...d, deductions: d.deductions.filter((_, i) => i !== di) }))}
                                          className="rounded p-1 text-rose-300 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => setRubricDraft(d => ({...d, deductions: [...d.deductions, {reason: '', penalty: 0}]}))}
                                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-rose-300 px-3 py-1.5 text-xs text-rose-500 hover:border-rose-400 hover:text-rose-700 transition">
                                      <Plus className="h-3 w-3" /> Add Deduction
                                    </button>
                                  </div>
                                  {rubricEditMsg && <p className={`text-xs ${rubricEditMsg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{rubricEditMsg.text}</p>}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {pPerf.map((lv, li) => {
                                    const rawLv = String(lv.level ?? `Band ${li + 1}`);
                                    const { pill, border } = bandColor(rawLv);
                                    return (
                                      <div key={li} className={`rounded-xl border px-4 py-3 space-y-1.5 ${border}`}>
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill}`}>{rawLv}</span>
                                          <div className="flex items-center gap-3 text-xs text-slate-500">
                                            {lv.score_range != null && <span className="font-semibold text-slate-700">{String(lv.score_range)}</span>}
                                            {lv.threshold != null && <span>{String(lv.threshold)}</span>}
                                          </div>
                                        </div>
                                        {lv.description != null && <p className="text-sm text-slate-700 leading-relaxed">{String(lv.description)}</p>}
                                      </div>
                                    );
                                  })}
                                  {pDed.length > 0 && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 divide-y divide-rose-100">
                                      {pDed.map((ded, di) => (
                                        <div key={di} className="flex items-center justify-between px-4 py-2.5 gap-2">
                                          <p className="text-sm text-rose-800">{String(ded.reason ?? '')}</p>
                                          <span className="shrink-0 text-xs font-semibold text-rose-700">−{String(ded.penalty ?? 0)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                          {pSample && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Sample Answer</p>
                              <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
                                <p className="text-sm text-violet-900 leading-relaxed whitespace-pre-wrap">{pSample}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}


                    {/* Performance levels and Deductions — top-level questions */}
                    {hasOwnRubric && (() => {
                      const rubricId = String(q.canonical_question_id ?? label);
                      const isEditingRubric = editingRubricId === rubricId;
                      return (
                        <div className="ml-10 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rubric</p>
                            {!isEditingRubric ? (
                              <button type="button" onClick={() => startEditRubric(rubricId, perfLevels, deductions)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button type="button" disabled={rubricSaving} onClick={() => saveRubricEdits(q)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60">
                                  {rubricSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} Save
                                </button>
                                <button type="button" onClick={() => { setEditingRubricId(null); setRubricEditMsg(null); }}
                                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          {isEditingRubric ? (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Performance Levels</p>
                                {rubricDraft.perfLevels.map((lv, li) => {
                                  const { border } = bandColor(lv.level);
                                  return (
                                    <div key={li} className={`rounded-xl border p-3 space-y-2 ${border}`}>
                                      <div className="flex items-center gap-2">
                                        <input value={lv.level} onChange={e => setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], level: e.target.value}; return {...d, perfLevels: pl}; })}
                                          className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-400" placeholder="Band label" />
                                        <input value={lv.score_range ?? ''} onChange={e => setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], score_range: e.target.value}; return {...d, perfLevels: pl}; })}
                                          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-400" placeholder="Score range" />
                                        <input value={lv.threshold ?? ''} onChange={e => setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], threshold: e.target.value}; return {...d, perfLevels: pl}; })}
                                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-400" placeholder="Threshold" />
                                        <button type="button" onClick={() => setRubricDraft(d => ({ ...d, perfLevels: d.perfLevels.filter((_, i) => i !== li) }))}
                                          className="ml-auto rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                      </div>
                                      <textarea value={lv.description} onChange={e => { setRubricDraft(d => { const pl = [...d.perfLevels]; pl[li] = {...pl[li], description: e.target.value}; return {...d, perfLevels: pl}; }); }}
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-slate-400" placeholder="Description…" />
                                    </div>
                                  );
                                })}
                                <button type="button" onClick={() => setRubricDraft(d => ({...d, perfLevels: [...d.perfLevels, {level: `Band ${d.perfLevels.length + 1}`, description: '', score_range: '', threshold: ''}]}))}
                                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700 transition">
                                  <Plus className="h-3 w-3" /> Add Level
                                </button>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Deductions</p>
                                {rubricDraft.deductions.map((ded, di) => (
                                  <div key={di} className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                                    <textarea value={ded.reason} onChange={e => { setRubricDraft(d => { const dd = [...d.deductions]; dd[di] = {...dd[di], reason: e.target.value}; return {...d, deductions: dd}; }); }}
                                      rows={1}
                                      className="flex-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs outline-none focus:border-rose-400" placeholder="Deduction reason…" />
                                    <input type="number" step={0.5} value={ded.penalty} onChange={e => setRubricDraft(d => { const dd = [...d.deductions]; dd[di] = {...dd[di], penalty: Number(e.target.value)}; return {...d, deductions: dd}; })}
                                      className="w-16 rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs outline-none focus:border-rose-400" placeholder="−pts" />
                                    <button type="button" onClick={() => setRubricDraft(d => ({ ...d, deductions: d.deductions.filter((_, i) => i !== di) }))}
                                      className="rounded p-1 text-rose-300 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => setRubricDraft(d => ({...d, deductions: [...d.deductions, {reason: '', penalty: 0}]}))}
                                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-rose-300 px-3 py-1.5 text-xs text-rose-500 hover:border-rose-400 hover:text-rose-700 transition">
                                  <Plus className="h-3 w-3" /> Add Deduction
                                </button>
                              </div>
                              {rubricEditMsg && <p className={`text-xs ${rubricEditMsg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{rubricEditMsg.text}</p>}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {perfLevels.map((lv, li) => {
                                const rawLv = String(lv.level ?? `Band ${li + 1}`);
                                const { pill, border } = bandColor(rawLv);
                                return (
                                  <div key={li} className={`rounded-xl border px-4 py-3 space-y-1.5 ${border}`}>
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill}`}>{rawLv}</span>
                                      <div className="flex items-center gap-3 text-xs text-slate-500">
                                        {lv.score_range != null && <span className="font-semibold text-slate-700">{String(lv.score_range)}</span>}
                                        {lv.threshold != null && <span>{String(lv.threshold)}</span>}
                                      </div>
                                    </div>
                                    {lv.description != null && <p className="text-sm text-slate-700 leading-relaxed">{String(lv.description)}</p>}
                                  </div>
                                );
                              })}
                              {deductions.length > 0 && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 divide-y divide-rose-100">
                                  {deductions.map((ded, di) => (
                                    <div key={di} className="flex items-center justify-between px-4 py-2.5 gap-2">
                                      <p className="text-sm text-rose-800">{String(ded.reason ?? '')}</p>
                                      <span className="shrink-0 text-xs font-semibold text-rose-700">−{String(ded.penalty ?? 0)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Sample answer */}
                    {hasOwnRubric && sampleText && (
                      <div className="ml-10">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Sample Answer</p>
                        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
                          <p className="text-sm text-violet-900 leading-relaxed whitespace-pre-wrap">{sampleText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Rubric + Sample Answer + CTA */}
        <div className="space-y-6">

        {/* Step 2: Rubric */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                rubricFinalized ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
              }`}>
                {rubricFinalized ? <CheckCircle2 className="h-4 w-4" /> : '2'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Rubric</p>
                <p className="text-xs text-slate-500">Auto-generated from your paper · editable before finalizing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {rubricChecking ? (
                // Still fetching existing rubric — show neutral spinner, not "paper processing"
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking…
                </span>
              ) : rubricStatus ? (
                <StatusBadge status={rubricStatus} />
              ) : paperStatus !== 'SUCCESS' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Paper processing…
                </span>
              ) : (
                <button
                  type="button"
                  disabled={rubricCreating}
                  onClick={createRubric}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {rubricCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                  Create Rubric
                </button>
              )}
            </div>
          </div>

          {rubricActive && (
            <div className="flex items-center gap-2 bg-sky-50 px-5 py-4 text-sm text-sky-700">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Generating rubric from paper… this may take a moment.
            </div>
          )}

          {rubricStatus === 'FAILED' && (
            <div className="flex items-center justify-between bg-rose-50 px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Rubric generation failed.
              </div>
              <button type="button" onClick={createRubric} className="text-sm font-medium text-rose-700 underline">Retry</button>
            </div>
          )}

          {/* rubricMsg shown here always so errors from createRubric (e.g. 412) are visible */}
          {rubricMsg && (
            <div className="px-5 pb-2">
              <p className={`text-sm ${rubricMsg.ok ? 'text-emerald-600' : rubricMsg.warn ? 'text-amber-600' : 'text-rose-600'}`}>
                {rubricMsg.text}
              </p>
            </div>
          )}

          {rubricReady && !rubricFinalized && (
            <div className="px-5 pb-5">
              <button
                type="button"
                disabled={rubricFinalizing}
                onClick={finalizeRubric}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {rubricFinalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Finalize Rubric
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Sample Answer */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                shStatus === 'FINALIZED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {shStatus === 'FINALIZED' ? <CheckCircle2 className="h-4 w-4" /> : '3'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Sample Answer
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">optional</span>
                </p>
                <p className="text-xs text-slate-500">Upload a model answer to improve grading accuracy</p>
              </div>
            </div>
            {shStatus && <StatusBadge status={shStatus} />}
          </div>

          <div className="space-y-3 px-5 py-4">
            {/* Uploaded file card */}
            {shFileName && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                  <Upload className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{shFileName}</p>
                  <p className="text-xs text-slate-400">
                    {shStatus === 'FINALIZED' ? 'Finalized' : shStatus === 'SUCCESS' ? 'Ready' : 'Processing…'}
                  </p>
                </div>
                {shStatus === 'FINALIZED' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                {(shStatus === 'PENDING' || shStatus === 'RUNNING') && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />}
              </div>
            )}

            {/* Upload zone — always visible so user can replace even after finalize */}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
              <Upload className="h-5 w-5 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {shUploading
                    ? 'Uploading…'
                    : shFileName
                    ? 'Replace sample answer'
                    : 'Click to upload sample answer'}
                </p>
                <p className="text-xs text-slate-500">PDF / DOCX</p>
              </div>
              {shUploading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
              <input
                ref={shFileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={shUploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSampleAnswer(f); e.target.value = ''; }}
              />
            </label>

            {shStatus === 'SUCCESS' && (
              <button
                type="button"
                disabled={shFinalizing}
                onClick={finalizeSampleAnswer}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {shFinalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Finalize Sample Answer
              </button>
            )}

            {shMsg && (
              <p className={`text-sm ${shMsg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{shMsg.text}</p>
            )}
          </div>
        </div>

        {/* CTA: Go to Grade */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="font-semibold text-slate-900">Ready to grade?</p>
            <p className="text-sm text-slate-500">Upload student submissions and start auto-grading</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/papers/${paperId}/grade`)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Start Grading
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        </div>{/* end right column */}
        </div>{/* end grid */}

      </div>
    </main>
  );
}