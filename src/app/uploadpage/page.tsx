'use client';
 
import { useState, useRef, useEffect } from 'react';
import {
    FileText,
    Upload,
    RefreshCw,
    Settings2,
    ChevronRight,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
} from 'lucide-react';
 
type PaperItem = {
    id: number | string;
    name: string;
    createdAt?: string;
    validationStatus?: string;
    totalMarks?: number;
    message?: string;
    gradingResult?: any;
};
 
type ValidationStatus = 'READY' | 'PENDING' | 'ERROR' | string;
 
const STATUS_STYLES: Record<string, string> = {
    READY: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    ERROR: 'bg-red-100 text-red-700',
};
 
const STORAGE_KEY = 'edgenai_papers';
 
function StatusBadge({ status }: { status: ValidationStatus }) {
    const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
    const Icon = status === 'READY' ? CheckCircle2 : status === 'ERROR' ? AlertCircle : Clock;
    return (
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {status}
        </span>
    );
}
 
function generatePaperId(): string {
    return `paper_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
 
function loadPapers(): PaperItem[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}
 
function savePapers(papers: PaperItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    } catch {
        // storage full or unavailable — fail silently
    }
}
 
export default function MyPapersPage() {
    const [papers, setPapers] = useState<PaperItem[]>([]);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
 
    // Load from localStorage on first render
    useEffect(() => {
        setPapers(loadPapers());
    }, []);
 
    // Helper: update state AND persist in one call
    function updatePapers(updater: (prev: PaperItem[]) => PaperItem[]) {
        setPapers((prev) => {
            const next = updater(prev);
            savePapers(next);
            return next;
        });
    }
 
    function handleFilesSelected(files: FileList | null) {
        if (!files?.length) return;
        const incoming = Array.from(files);
        setStagedFiles((prev) => {
            const existingNames = new Set(prev.map((f) => f.name));
            return [...prev, ...incoming.filter((f) => !existingNames.has(f.name))];
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
 
    async function handleSubmit() {
        if (!stagedFiles.length || uploading) return;
        setUploading(true);
 
        for (const file of stagedFiles) {
            const tempId = generatePaperId();
 
            // Add PENDING row immediately and persist it
            updatePapers((prev) => [
                {
                    id: tempId,
                    name: file.name,
                    validationStatus: 'PENDING',
                    createdAt: new Date().toISOString(),
                    totalMarks: 0,
                },
                ...prev,
            ]);
 
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('paperId', tempId);
 
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
 
                const uploadData = await uploadRes.json();
 
                if (!uploadRes.ok) {
                    throw new Error(
                        uploadData?.detail?.raw ||
                        uploadData?.detail?.error ||
                        uploadData?.error ||
                        'Upload failed'
                    );
                }
 
                const submissionId = uploadData?.submission_id ?? uploadData?.id;
 
                updatePapers((prev) =>
                    prev.map((p) =>
                        p.id === tempId
                            ? {
                                ...p,
                                id: submissionId ?? tempId,
                                validationStatus: submissionId ? 'PENDING' : 'READY',
                                totalMarks: uploadData?.total_marks ?? 0,
                                message: uploadData?.message,
                            }
                            : p
                    )
                );
 
                if (submissionId) {
                    const params = new URLSearchParams({ submissionId: String(submissionId) });
                    const gradingRes = await fetch(`/api/grading?${params.toString()}`, {
                        method: 'GET',
                        cache: 'no-store',
                    });
 
                    const gradingData = await gradingRes.json();
 
                    updatePapers((prev) =>
                        prev.map((p) =>
                            p.id === (submissionId ?? tempId)
                                ? {
                                    ...p,
                                    validationStatus: gradingRes.ok ? 'READY' : 'ERROR',
                                    totalMarks: gradingData?.total_marks ?? p.totalMarks,
                                    gradingResult: gradingData,
                                    message: gradingRes.ok ? undefined : 'Grading failed',
                                }
                                : p
                        )
                    );
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Something went wrong';
                updatePapers((prev) =>
                    prev.map((p) =>
                        p.id === tempId ? { ...p, validationStatus: 'ERROR', message } : p
                    )
                );
            }
        }
 
        setStagedFiles([]);
        if (inputRef.current) inputRef.current.value = '';
        setUploading(false);
    }
 
    function handleDelete(id: number | string) {
        updatePapers((prev) => prev.filter((p) => p.id !== id));
    }
 
    const readyCount = papers.filter((p) => p.validationStatus === 'READY').length;
 
    return (
        <>
            <header className="border-b border-black/10 bg-[#f5f5f3]">
                <div className="mx-auto flex h-[56px] items-center justify-between px-6">
                    <span className="text-base font-semibold text-[#111111]">EdgenAI</span>
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-[#667085]">My Papers</span>
                        <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d3557] text-sm font-semibold text-white"
                        >
                            A
                        </button>
                    </div>
                </div>
            </header>
 
            <main className="min-h-screen bg-gray-100" aria-label="My Papers">
                <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="space-y-4">
 
                        <header>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">My Papers</h1>
                            <p className="mt-0.5 text-sm text-gray-500">
                                Upload exam papers and we'll grade them automatically.
                            </p>
                        </header>
 
                        {/* Upload card */}
                        <section
                            aria-label="Upload exam papers"
                            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                        >
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                className={`border-b border-dashed transition-colors ${
                                    dragOver
                                        ? 'border-gray-900 bg-gray-50'
                                        : stagedFiles.length
                                        ? 'border-gray-200 bg-gray-50'
                                        : 'border-transparent'
                                }`}
                            >
                                <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 px-4 text-center transition-all ${stagedFiles.length ? 'py-5' : 'py-10'}`}>
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx"
                                        className="sr-only"
                                        onChange={(e) => handleFilesSelected(e.target.files)}
                                    />
                                    <Upload
                                        className={`${stagedFiles.length ? 'h-6 w-6' : 'h-8 w-8'} ${dragOver ? 'text-gray-900' : 'text-gray-400'} transition-all`}
                                        strokeWidth={1.5}
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {dragOver ? 'Drop to add' : stagedFiles.length ? 'Drop more files or browse' : 'Drop your exam paper here'}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            PDF, DOC or DOCX · up to 5 MB each
                                        </p>
                                    </div>
                                    <span className="mt-1 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                        Browse files
                                    </span>
                                </label>
                            </div>
 
                            {/* Staged files */}
                            {stagedFiles.length > 0 && (
                                <div className="px-4 py-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-500">
                                        Ready to upload · {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''}
                                    </p>
 
                                    {stagedFiles.map((file) => (
                                        <div
                                            key={file.name}
                                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                                        >
                                            <FileText className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.5} aria-hidden="true" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                                                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                            <button
                                                onClick={() => removeStagedFile(file.name)}
                                                aria-label={`Remove ${file.name}`}
                                                className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
 
                                    <button
                                        onClick={handleSubmit}
                                        disabled={uploading}
                                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Upload className="h-4 w-4" aria-hidden="true" />
                                        {uploading
                                            ? 'Uploading…'
                                            : `Upload ${stagedFiles.length} paper${stagedFiles.length > 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            )}
                        </section>
 
                        {/* Papers list */}
                        <section
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                            aria-label="Uploaded papers list"
                        >
                            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-5">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">Uploaded Papers</h2>
                                    <p className="text-xs text-gray-500">
                                        {papers.length} total
                                        {papers.length > 0 && ` · ${readyCount} ready`}
                                        {uploading && ' · uploading…'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPapers(loadPapers())}
                                    aria-label="Refresh paper list"
                                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
 
                            <ul role="list" className="divide-y divide-gray-100">
                                {papers.length === 0 ? (
                                    <li className="px-5 py-10 text-center text-sm text-gray-400">
                                        No papers uploaded yet. Drop a file above to get started.
                                    </li>
                                ) : (
                                    papers.map((paper) => (
                                        <li key={paper.id}>
                                            <article
                                                aria-label={`Paper: ${paper.name}`}
                                                className="flex items-center gap-3 px-4 py-3 sm:px-5"
                                            >
                                                <FileText
                                                    className="hidden h-8 w-8 shrink-0 text-gray-300 sm:block"
                                                    strokeWidth={1.5}
                                                    aria-hidden="true"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {paper.name}
                                                    </p>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
                                                        {paper.createdAt && (
                                                            <time dateTime={paper.createdAt}>
                                                                {new Date(paper.createdAt).toLocaleDateString('en-AU', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </time>
                                                        )}
                                                        {(paper.totalMarks ?? 0) > 0 && (
                                                            <span>{paper.totalMarks} marks</span>
                                                        )}
                                                        {paper.message && (
                                                            <span className={paper.validationStatus === 'ERROR' ? 'text-red-400' : ''}>
                                                                {paper.message}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <StatusBadge status={paper.validationStatus ?? 'PENDING'} />
                                                    <button
                                                        aria-label={`Set up rubric for ${paper.name}`}
                                                        className="hidden items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:flex"
                                                    >
                                                        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Setup
                                                    </button>
                                                    <button
                                                        aria-label={`Grade submissions for ${paper.name}`}
                                                        className="flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                                                    >
                                                        <span className="hidden sm:inline">Grade</span>
                                                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(paper.id)}
                                                        aria-label={`Delete ${paper.name}`}
                                                        className="rounded-md p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </article>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>
 
                    </div>
                </div>
            </main>
        </>
    );
}