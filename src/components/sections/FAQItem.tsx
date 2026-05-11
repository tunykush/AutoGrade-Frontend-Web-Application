'use client';

import { useState } from 'react';

export default function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#23334A', border: '1px solid rgba(199,217,229,0.15)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left font-medium cursor-pointer"
        style={{ color: 'white' }}
      >
        {question}
        <span className="text-xl" style={{ color: '#C7D9E5' }}>{open ? "−" : "+"}</span>
      </button>

      <div
  className={`px-4 text-sm transition-all duration-300 ${open ? "block" : "hidden"}`}
  style={{ backgroundColor: 'white', color: '#23334A', padding: '16px 16px', marginTop: '0', borderTop: '1px solid rgba(50,75,115,0.1)' }}
>
  {answer}
</div>
    </div>
  );
}