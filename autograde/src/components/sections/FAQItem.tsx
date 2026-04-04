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
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left font-medium"
      >
        {question}
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      <div
        className={`px-4 pb-4 text-sm text-gray-300 transition-all duration-300 ${
          open ? "block" : "hidden"
        }`}
      >
        {answer}
      </div>
    </div>
  );
}