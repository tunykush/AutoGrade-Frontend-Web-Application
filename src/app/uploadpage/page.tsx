'use client';
 
import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Upload, RefreshCw, Settings2, ChevronRight, Trash2, CheckCircle2, Clock, AlertCircle, X, Loader2 } from 'lucide-react';

type PaperItem = {
    id: number | string;       
    name: string;
    createdAt?: string;
    validationStatus?: string;
    totalMarks?: number;
    message?: string;
};
 
// ────────────────────── Qh paper statuses to display states ──────────────────────
function normaliseStatus(raw?: string): string {
    if (!raw) return 'PENDING';
    const s = raw.toUpperCase();
    if (['READY', 'COMPLETED', 'COMPLETE', 'DONE', 'SUCCESS', 'FINALIZED'].includes(s)) return 'READY';
    if (['ERROR', 'FAILURE', 'FAILED'].includes(s)) return 'ERROR';
    if (['IN_PROGRESS', 'PROCESSING', 'QUEUED', 'STARTED', 'RUNNING'].includes(s)) return 'RUNNING';
    return s;
}
 
const TERMINAL = new Set(['READY', 'ERROR', 'FAILED', 'TIMEOUT', 'FINALIZED', 'SUCCESS']);
 
const STATUS_STYLES: Record<string, string> = {
    READY:   'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    RUNNING: 'bg-blue-100 text-blue-700',
    ERROR:   'bg-red-100 text-red-700',
};
 
// ────────────────────── localStorage, because API does not return the original filename at all ──────────────────────
const LS_KEY = 'edgenai_papers_v3';
 
function loadLocalPapers(): PaperItem[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); }
    catch { return []; }
}
 
function saveLocalPapers(papers: PaperItem[]) {
    const toSave = papers.filter((p) => !String(p.id).startsWith('temp_'));
    try { localStorage.setItem(LS_KEY, JSON.stringify(toSave)); } catch {}
}
 
function StatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
    const Icon =
        status === 'READY'   ? CheckCircle2 :
        status === 'ERROR'   ? AlertCircle  :
        status === 'RUNNING' ? Loader2      : Clock;
    return (
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
            <Icon className={`h-3 w-3 ${status === 'RUNNING' ? 'animate-spin' : ''}`} aria-hidden="true" />
            {status}
        </span>
    );
}
 
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
 
export default function MyPapersPage() {
    const [papers, setPapers]           = useState<PaperItem[]>([]);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [dragOver, setDragOver]       = useState(false);
    const [uploading, setUploading]     = useState(false);
    const [syncing, setSyncing]         = useState(false);
    const [listError, setListError]     = useState('');
    const [deleteTarget, setDeleteTarget] = useState<PaperItem | null>(null);
    const [deleting, setDeleting]         = useState(false);
    const [deleteError, setDeleteError]   = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
 
    function updatePapers(updater: (prev: PaperItem[]) => PaperItem[]) {
        setPapers((prev) => {
            const next = updater(prev);
            saveLocalPapers(next);
            return next;
        });
    }
 
    // ────────────────────── load local cache and then sync from API after short delay ──────────────────────
    useEffect(() => {
        const saved = loadLocalPapers();
        setPapers(saved);
        const t = setTimeout(() => syncPapers(saved), 2000);
        return () => clearTimeout(t);
    }, []);
 
    // ────────────────────── sync the paper list from Qh List Papers ──────────────────────
    const syncPapers = useCallback(async (currentPapers?: PaperItem[]) => {
        setSyncing(true);
        setListError('');
        try {
            const res = await fetch('/api/papers', { cache: 'no-store' });
            const data = await res.json();
 
            if (!res.ok) {
                if (res.status === 429) {
                    setListError('Rate limited — try again in a moment.');
                    return;
                }
                setListError(data?.error ?? 'Failed to sync.');
                return;
            }
 
            if (!Array.isArray(data)) return;
 
            const statusMap: Record<string, string> = {};
            for (const p of data) {
                statusMap[String(p.paper_id ?? p.id)] = normaliseStatus(p.validation_status ?? p.status);
            }
 
            updatePapers((prev) =>
                prev.map((p) => {
                    const apiStatus = statusMap[String(p.id)];
                    if (!apiStatus) return p;
                    return { ...p, validationStatus: apiStatus };
                })
            );
        } catch {
            setListError('Could not reach the server.');
        } finally {
            setSyncing(false);
        }
    }, []);
 
    const handleRefresh = useCallback(() => syncPapers(), [syncPapers]);
 
    // ────────────────────── Poll a single submission's status until terminal ──────────────────────
    async function pollPaperStatus(paperId: string | number) {
        await sleep(15_000);
        const MAX_ATTEMPTS = 30;
        let interval = 10_000;
 
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            try {
                const res  = await fetch(`/api/status?paperId=${paperId}`, { cache: 'no-store' });
                const data = await res.json();
 
                if (res.status === 429) { await sleep(15_000); continue; }
 
                const status = normaliseStatus(data?.validation_status ?? data?.status);
 
                updatePapers((prev) =>
                    prev.map((p) => p.id === paperId ? { ...p, validationStatus: status } : p)
                );
 
                if (TERMINAL.has(status)) break;
            } catch {
                await sleep(interval);
            }
            await sleep(interval);
            interval = Math.min(interval * 1.5, 30_000);
        }
    }
 
    // ────────────────────── File staging ──────────────────────
    function handleFilesSelected(files: FileList | null) {
        if (!files?.length) return;
        const incoming = Array.from(files);
 
        const uploadedNames = new Set(papers.map((p) => p.name.toLowerCase()));
        const duplicates = incoming.filter((f) => uploadedNames.has(f.name.toLowerCase()));
 
        if (duplicates.length > 0) {
            const names = duplicates.map((f) => `"${f.name}"`).join(', ');
            alert(`${names} ${duplicates.length > 1 ? 'have' : 'has'} already been uploaded.`);
            const valid = incoming.filter((f) => !uploadedNames.has(f.name.toLowerCase()));
            if (!valid.length) return;
            setStagedFiles((prev) => {
                const existing = new Set(prev.map((f) => f.name.toLowerCase()));
                return [...prev, ...valid.filter((f) => !existing.has(f.name.toLowerCase()))];
            });
            return;
        }
 
        setStagedFiles((prev) => {
            const existing = new Set(prev.map((f) => f.name.toLowerCase()));
            return [...prev, ...incoming.filter((f) => !existing.has(f.name.toLowerCase()))];
        });
    }
 
    function removeStagedFile(name: string) {
        setStagedFiles((prev) => prev.filter((f) => f.name !== name));
        if (inputRef.current) inputRef.current.value = '';
    }
 
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        handleFilesSelected(e.dataTransfer.files);
    }
 
    // ────────────────────── Submit staged files ──────────────────────
    async function handleSubmit() {
        if (!stagedFiles.length || uploading) return;
        setUploading(true);
 
        for (const file of stagedFiles) {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

            updatePapers((prev) => [{
                id:               tempId,
                name:             file.name,
                validationStatus: 'PENDING',
                createdAt:        new Date().toISOString(),
                totalMarks:       0,
            }, ...prev]);
 
            try {
                const formData = new FormData();
                formData.append('file', file);
 
                const uploadRes  = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
 
                if (!uploadRes.ok) {
                    throw new Error(uploadData?.detail?.raw || uploadData?.error || 'Upload failed');
                }

                const paperId = uploadData?.paper_id ?? uploadData?.id ?? null;
 
                updatePapers((prev) => {
                    const idAlreadyExists = paperId && prev.some(
                        (p) => String(p.id) === String(paperId) && p.id !== tempId
                    );
                    if (idAlreadyExists) {
                        return prev.filter((p) => p.id !== tempId);
                    }
                    return prev.map((p) =>
                        p.id === tempId
                            ? {
                                ...p,
                                id:               paperId ?? tempId,
                                name:             file.name,
                                validationStatus: 'RUNNING',
                                message:          undefined,
                              }
                            : p
                    );
                });

                if (paperId) pollPaperStatus(paperId);
 
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Something went wrong';
                updatePapers((prev) =>
                    prev.map((p) =>
                        p.id === tempId ? { ...p, validationStatus: 'ERROR', message } : p
                    )
                );
            }
 
            if (stagedFiles.length > 1) await sleep(2_000);
        }
 
        setStagedFiles([]);
        if (inputRef.current) inputRef.current.value = '';
        setUploading(false);
    }
 
    // ────────────────────── delete paper ──────────────────────
    function confirmDelete(paper: PaperItem) {
        setDeleteTarget(paper);
        setDeleteError('');
    }
 
    async function executeDelete() {
        if (!deleteTarget || deleting) return;
        setDeleting(true);
        setDeleteError('');

        if (String(deleteTarget.id).startsWith('temp_')) {
            updatePapers((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            setDeleteTarget(null);
            setDeleting(false);
            return;
        }
 
        try {
            const res = await fetch(`/api/delete-paper?paperId=${encodeURIComponent(deleteTarget.id)}`, {
                method: 'DELETE',
            });
 
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setDeleteError(data?.error ?? `Delete failed (${res.status})`);
                return;
            }
 
            // ────────────────────── remove from local state as well ──────────────────────
            updatePapers((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch {
            setDeleteError('Could not reach the server. Please try again.');
        } finally {
            setDeleting(false);
        }
    }
 
    const readyCount = papers.filter((p) => p.validationStatus === 'READY').length;
 
    return (
        <>
            {/* ────────────────────── Page Header ────────────────────── */}
            <header className="border-b border-black/10 bg-[#f5f5f3]">
                <div className="mx-auto flex h-[56px] items-center justify-between px-6">
                    <span className="text-base font-semibold text-[#111111]">EdgenAI</span>
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-[#667085]">My Papers</span>
                        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d3557] text-sm font-semibold text-white">
                            A
                        </button>
                    </div>
                </div>
            </header>
 
            <main className="min-h-screen bg-gray-100">
                <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
 
                    <header>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">My Papers</h1>
                        <p className="mt-0.5 text-sm text-gray-500">Upload exam papers and we'll extract and process them automatically.</p>
                    </header>
 
                    {/* ────────────────────── Upload Area ────────────────────── */}
                    <section
                        className={`relative rounded-xl border-2 border-dashed bg-white overflow-hidden transition-colors ${
                            dragOver ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
                        }}
                        onDrop={handleDrop}
                    >
                        {dragOver && (
                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gray-900/10 rounded-xl">
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-gray-700" strokeWidth={1.5} />
                                    <p className="text-sm font-semibold text-gray-700">Drop to add</p>
                                </div>
                            </div>
                        )}
 
                        <div className={stagedFiles.length ? 'border-b border-gray-200' : ''}>
                            <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 px-4 text-center transition-all ${stagedFiles.length ? 'py-5' : 'py-10'}`}>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    className="sr-only"
                                    onChange={(e) => handleFilesSelected(e.target.files)}
                                />
                                <Upload className="h-8 w-8 text-gray-400 transition-all" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {stagedFiles.length ? 'Drop more files or browse' : 'Drop your exam paper here'}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400">PDF, DOC or DOCX · up to 5 MB each</p>
                                </div>
                                <span className="mt-1 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                    Browse files
                                </span>
                            </label>
                        </div>
 
                        {stagedFiles.length > 0 && (
                            <div className="px-4 py-3 space-y-2">
                                <p className="text-xs font-medium text-gray-500">
                                    Ready to upload · {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''}
                                </p>
                                {stagedFiles.map((file) => (
                                    <div key={file.name} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                        <FileText className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.5} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                        <button onClick={() => removeStagedFile(file.name)} aria-label={`Remove ${file.name}`} className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleSubmit}
                                    disabled={uploading}
                                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                >
                                    <Upload className="h-4 w-4" />
                                    {uploading ? 'Uploading…' : `Upload ${stagedFiles.length} paper${stagedFiles.length > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        )}
                    </section>
 
                    {/* ────────────────────── Papers List ────────────────────── */}
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-5">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Uploaded Papers</h2>
                                <p className="text-xs text-gray-500">
                                    {papers.filter(p => !String(p.id).startsWith('temp_')).length} total
                                    {readyCount > 0 && ` · ${readyCount} ready`}
                                    {uploading && ' · uploading…'}
                                    {syncing && ' · syncing…'}
                                </p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={syncing}
                                aria-label="Refresh paper list"
                                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
 
                        {listError && (
                            <p className="px-5 py-2 text-xs text-amber-600 bg-amber-50 border-b border-amber-100">
                                {listError}
                            </p>
                        )}
 
                        <ul role="list" className="divide-y divide-gray-100">
                            {papers.length === 0 ? (
                                <li className="px-5 py-10 text-center text-sm text-gray-400">
                                    No papers uploaded yet. Drop a file above to get started.
                                </li>
                            ) : (
                                papers.map((paper) => (
                                    <li key={paper.id}>
                                        <article aria-label={`Paper: ${paper.name}`} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                                            <FileText className="hidden h-8 w-8 shrink-0 text-gray-300 sm:block" strokeWidth={1.5} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">{paper.name}</p>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
                                                    {paper.createdAt && (
                                                        <time dateTime={paper.createdAt}>
                                                            {new Date(paper.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </time>
                                                    )}

                                                    {!String(paper.id).startsWith('temp_') && (
                                                        <span className="font-mono text-gray-300">#{paper.id}</span>
                                                    )}
                                                    {(paper.totalMarks ?? 0) > 0 && <span>{paper.totalMarks} marks</span>}
                                                    {paper.message && (
                                                        <span className={paper.validationStatus === 'ERROR' ? 'text-red-400' : 'text-gray-400'}>
                                                            {paper.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <StatusBadge status={paper.validationStatus ?? 'PENDING'} />

                                                <button
                                                    aria-label={`Set up rubric for ${paper.name}`}
                                                    disabled={paper.validationStatus !== 'READY'}
                                                    className="hidden items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed sm:flex"
                                                >
                                                    <Settings2 className="h-3.5 w-3.5" />
                                                    Setup
                                                </button>
                                                {/* ────────────────────── grade button to navigate to Grading page with paper_id ────────────────────── */}
                                                <button
                                                    aria-label={`Grade submissions for ${paper.name}`}
                                                    disabled={paper.validationStatus !== 'READY'}
                                                    className="flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <span className="hidden sm:inline">Grade</span>
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => confirmDelete(paper)} aria-label={`Delete ${paper.name}`} className="rounded-md p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </article>
                                    </li>
                                ))
                            )}
                        </ul>
                    </section>
                </div>
            </main>
 
            {/* ────────────────────── Delete Confirmation Modal ────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
                    <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </div>
                                <div className="min-w-0">
                                    <h2 id="delete-modal-title" className="text-sm font-semibold text-gray-900">Delete paper?</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        <span className="font-medium text-gray-800 break-all">{deleteTarget.name}</span> will be permanently deleted and cannot be recovered.
                                    </p>
                                    {deleteError && (
                                        <p className="mt-2 text-xs text-red-500">{deleteError}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
                            <button
                                onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                                disabled={deleting}
                                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={deleting}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}