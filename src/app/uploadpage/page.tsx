'use client';

import Link from 'next/link'
import React from 'react'
import TopBar from '@/components/auth/topbar'
import DashboardProfile from '@/components/auth/dashboardprofile'
import { useState, useRef } from 'react';
import {
    FileText,
    Upload,
    RefreshCw,
    Settings2,
    ChevronRight,
    Trash2,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import UserMenu from '@/components/auth/usermenu';
import AuthLayout from '@/components/auth/authlayout';

type PaperItem = {
    id: number | string;
    name: string;
    createdAt?: string;
    validationStatus?: string;
    isFinalized?: boolean;
    totalMarks?: number;
    message?: string;
};

type ValidationStatus = 'READY' | 'PENDING' | 'ERROR' | string;

const STATUS_STYLES: Record<string, string> = {
    READY: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    ERROR: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: ValidationStatus }) {
    const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
    const Icon = status === 'READY' ? CheckCircle2 : Clock;
    return (
        <span
        className={`flex flex-col min-h-screen items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
        >
        <Icon className="h-3 w-3" aria-hidden="true" />
        {status}
        </span>
    );
}

export default function MyPapersPage() {
    const [papers, setPapers] = useState<PaperItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFilesSelected(files: FileList | null) {
        if (!files?.length) return;
            setUploading(true);
        try {
            const uploaded: PaperItem[] = [];
        for (const file of Array.from(files)) {
            const paper = await uploadPaper(file);
            uploaded.push({
                id: paper.paper_id,
                name: file.name,
                validationStatus: paper.validation_status ?? 'PENDING',
                isFinalized: paper.is_finalized ?? false,
                totalMarks: paper.total_marks ?? 0,
                message: paper.message,
                createdAt: new Date().toISOString(),
            });
        }
        setPapers((prev) => [...uploaded, ...prev]);
        } finally {
        setUploading(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        handleFilesSelected(e.dataTransfer.files);
    }

    function handleDelete(id: number | string) {
        setPapers((prev) => prev.filter((p) => p.id !== id));
    }

    const readyCount = papers.filter((p) => p.validationStatus === 'READY').length;

  return (
    <>
    {/* ----------------- Page Header ----------------- */}
    <header className="border-b border-black/10 bg-[#f5f5f3]">
        <div className="mx-auto flex h-[56px] items-center justify-between px-6">
            <div className="flex items-center gap-3">
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0f172a] text-white text-xs font-bold">
                ⌘
            </div> */}
            <span className="text-base font-semibold text-[#111111]">EdgenAI</span>
            </div>

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

    {/* <>
    <TopBar/> */}

    <main
        className="min-h-screen bg-gray-100"
        aria-label="My Papers upload and manage exam papers"
    >
        {/* ----------------- Upload Container ----------------- */}
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-4">

            {/* ----------------- Upload Header ----------------- */}
            <header>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">My Papers</h1>
                <p className="mt-0.5 text-sm text-gray-500">Upload exam papers, Configure rubrics, and Grade student submissions.</p>
            </header>

            {/* ----------------- Upload Area ----------------- */}
            <section
                aria-label="Upload exam papers"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed bg-white transition-colors ${
                dragOver
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
          >
                <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 px-4 py-6 text-center">
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="sr-only" 
                    onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <Upload
                    className={`mt-7 ${dragOver ? 'text-gray-900' : 'text-gray-400'}`}
                    strokeWidth={1.5}
                    aria-hidden="true"
                />
                <div>
                    <p className="text-sm font-semibold text-gray-800">
                    {dragOver ? 'Drop to upload' : 'Drop your exam paper here'}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                    PDF, DOC or DOCX · up to 5 MB each · max 10 files
                    </p>
                </div>
                <span className="mt-3 mb-7 inline-flex items-center rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-70">
                    Browse files
                </span>
                </label>
            </section>

          {/* ----------------- Papers List (after uploaded) ----------------- */}
          <section
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                aria-label="Uploaded papers list"
          >
            {/* ----------------- Papers List header ----------------- */}
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
                    aria-label="Refresh paper list"
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* ----------------- Papers Rows ----------------- */}
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
                        {/* ----------------- File Icon ----------------- */}
                        <FileText
                            className="hidden h-8 w-8 shrink-0 text-gray-300 sm:block"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                        {/* ----------------- Papers Info ----------------- */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-gray-900">{paper.name}</p>
                                {/* ID chip: hidden on xs so name has full width */}
                                <span className="hidden shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 sm:inline">#{paper.id}</span>
                            </div>
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
                                <span>{paper.totalMarks ?? 0} marks</span>
                                {paper.message && <span>{paper.message}</span>}
                            </div>
                        </div>

                      {/* ----------------- Actions & Status ----------------- */}
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

async function uploadPaper(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/papers/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to upload paper');
    return res.json();
}