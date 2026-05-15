'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, HelpCircle, X } from 'lucide-react';

type GuideStep = {
  eyebrow: string;
  title: string;
  body: string;
  target: string;
};

type TargetBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const DEFAULT_STEPS: GuideStep[] = [
  {
    eyebrow: 'Start here',
    title: 'Use the top navigation',
    body: 'Move between AutoGrade, About, and account actions from the header. Key actions stay near the main content area.',
    target: 'body',
  },
  {
    eyebrow: 'Tip',
    title: 'Follow the primary button',
    body: 'Each page keeps the next important action visually prominent, so you can progress without reading every control.',
    target: 'body',
  },
];

const GUIDE_BY_ROUTE: { match: (path: string) => boolean; key: string; steps: GuideStep[] }[] = [
  {
    key: 'home',
    match: (path) => path === '/' || path === '/homepage',
    steps: [
      {
        eyebrow: 'Welcome',
        title: 'Explore EdGenAI',
        body: 'Scroll through the sections to understand how AutoGrade helps transform exam papers into grading workflows.',
        target: 'body',
      },
      {
        eyebrow: 'Next step',
        title: 'Open AutoGrade',
        body: 'Use the AutoGrade link in the navigation when you are ready to upload a paper and begin setup.',
        target: 'body',
      },
    ],
  },
  {
    key: 'papers',
    match: (path) => path === '/papers',
    steps: [
      {
        eyebrow: 'Step 1',
        title: 'Upload an exam paper',
        body: 'Drop a PDF, DOC, or DOCX into the upload zone. The paper list updates after the backend finishes processing.',
        target: 'papers-upload',
      },
      {
        eyebrow: 'Step 2',
        title: 'Set up before grading',
        body: 'When a paper is ready, open Setup to review extracted questions, create the rubric, and add a sample answer.',
        target: 'papers-setup',
      },
      {
        eyebrow: 'Step 3',
        title: 'Grade submissions',
        body: 'After setup is complete, go to Grade to upload student answers and review AI-generated results.',
        target: 'papers-grade',
      },
    ],
  },
  {
    key: 'setup',
    match: (path) => /^\/papers\/[^/]+\/setup$/.test(path),
    steps: [
      {
        eyebrow: 'Setup',
        title: 'Check extracted questions',
        body: 'Start by confirming the paper is processed and the extracted question structure looks correct.',
        target: 'setup-questions',
      },
      {
        eyebrow: 'Rubric',
        title: 'Create and review the rubric',
        body: 'Generate the rubric, inspect the criteria, then finalize it only when the marking guide is ready.',
        target: 'setup-rubric',
      },
      {
        eyebrow: 'Sample answer',
        title: 'Upload the reference answer',
        body: 'Add the sample answer so grading has a clear benchmark before student submissions are uploaded.',
        target: 'setup-sample',
      },
      {
        eyebrow: 'Finish setup',
        title: 'Move into grading',
        body: 'Once the setup is ready, use this action to start uploading student submissions.',
        target: 'setup-start-grading',
      },
    ],
  },
  {
    key: 'grade',
    match: (path) => /^\/papers\/[^/]+\/grade$/.test(path),
    steps: [
      {
        eyebrow: 'Grade',
        title: 'Upload student answers',
        body: 'Drop student answer files into the upload area. Each upload creates a submission row with live status.',
        target: 'grade-upload',
      },
      {
        eyebrow: 'Review',
        title: 'Wait for successful validation',
        body: 'When grading finishes, open the result to inspect scores, evidence, and feedback before exporting or sharing.',
        target: 'grade-submissions',
      },
    ],
  },
  {
    key: 'result',
    match: (path) => /^\/papers\/[^/]+\/grade\/[^/]+$/.test(path),
    steps: [
      {
        eyebrow: 'Result',
        title: 'Review the grading evidence',
        body: 'Use the score breakdown and evidence snippets to verify why each mark was awarded.',
        target: 'body',
      },
      {
        eyebrow: 'Quality check',
        title: 'Look for missing context',
        body: 'If a result looks unusual, compare it with the original submission and rubric before making a final decision.',
        target: 'body',
      },
    ],
  },
  {
    key: 'auth',
    match: (path) => ['/signin', '/signup', '/reset-password'].includes(path),
    steps: [
      {
        eyebrow: 'Account',
        title: 'Sign in to continue',
        body: 'Use your EdGenAI account to access saved papers, grading history, and secure upload features.',
        target: 'body',
      },
    ],
  },
  {
    key: 'info',
    match: (path) => ['/about', '/contact', '/waitlist'].includes(path),
    steps: [
      {
        eyebrow: 'Info',
        title: 'Learn more or reach out',
        body: 'This page is informational. Use the forms or navigation links when you are ready to connect or return to AutoGrade.',
        target: 'body',
      },
    ],
  },
];

function getRouteGuide(pathname: string) {
  return GUIDE_BY_ROUTE.find((guide) => guide.match(pathname)) ?? {
    key: 'default',
    steps: DEFAULT_STEPS,
  };
}

export default function MinimalGuide() {
  const pathname = usePathname();
  const guide = React.useMemo(() => getRouteGuide(pathname), [pathname]);
  const storageKey = `minimal-guide:${guide.key}:v1`;
  const [open, setOpen] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [targetBox, setTargetBox] = React.useState<TargetBox | null>(null);

  React.useEffect(() => {
    setStepIndex(0);
    const timer = window.setTimeout(() => {
      setOpen(localStorage.getItem(storageKey) !== 'dismissed');
    }, 500);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  const step = guide.steps[stepIndex];
  const isLast = stepIndex === guide.steps.length - 1;

  React.useEffect(() => {
    if (!open || !step) return;
    let didScrollToTarget = false;

    const updateTarget = () => {
      const element = step.target === 'body'
        ? document.body
        : document.querySelector<HTMLElement>(`[data-guide="${step.target}"]`);

      if (!element) {
        setTargetBox(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setTargetBox({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });

      if (step.target !== 'body' && !didScrollToTarget) {
        didScrollToTarget = true;
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    };

    updateTarget();
    const retry = window.setTimeout(updateTarget, 350);
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);
    return () => {
      window.clearTimeout(retry);
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget, true);
    };
  }, [open, step]);

  const dismiss = React.useCallback(() => {
    localStorage.setItem(storageKey, 'dismissed');
    setOpen(false);
  }, [storageKey]);

  if (!open || !step) return null;

  const isAnchored = Boolean(targetBox && step.target !== 'body');
  const popoverStyle = getPopoverStyle(targetBox);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {isAnchored && targetBox && (
        <div
          className="absolute rounded-3xl border-2 border-slate-950/80 bg-white/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.22),0_18px_60px_rgba(15,23,42,0.22)] transition-all duration-200"
          style={{
            top: targetBox.top - window.scrollY - 8,
            left: targetBox.left - window.scrollX - 8,
            width: targetBox.width + 16,
            height: targetBox.height + 16,
          }}
        />
      )}
      <section
        role="dialog"
        aria-label="Page guide"
        className="pointer-events-auto absolute w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-900 shadow-[0_20px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200"
        style={popoverStyle}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{step.eyebrow}</p>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950">{step.title}</h2>
            <p className="mt-2 text-sm leading-5 text-slate-600">{step.body}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {guide.steps.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === stepIndex ? 'w-5 bg-slate-950' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={dismiss} className="px-3 py-2 text-xs font-medium text-slate-500 transition hover:text-slate-900">
              Skip
            </button>
            <button
              type="button"
              onClick={() => isLast ? dismiss() : setStepIndex((current) => current + 1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function getPopoverStyle(targetBox: TargetBox | null): React.CSSProperties {
  if (typeof window === 'undefined') {
    return { bottom: 24, right: 24 };
  }

  if (!targetBox) {
    return { bottom: 24, right: 24 };
  }

  const gap = 18;
  const width = Math.min(384, window.innerWidth - 32);
  const viewportPadding = 16;
  const rectTop = targetBox.top - window.scrollY;
  const rectLeft = targetBox.left - window.scrollX;
  const rectBottom = rectTop + targetBox.height;
  const rectCenter = rectLeft + targetBox.width / 2;
  const left = Math.min(Math.max(rectCenter - width / 2, viewportPadding), window.innerWidth - width - viewportPadding);
  const placeBelow = rectBottom + 260 < window.innerHeight;

  return {
    width,
    left,
    top: placeBelow ? rectBottom + gap : undefined,
    bottom: placeBelow ? undefined : Math.max(window.innerHeight - rectTop + gap, viewportPadding),
  };
}