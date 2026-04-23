'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

export default function TagInput({
  value, onChange, placeholder = 'Add tag and press Enter',
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setInput('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-10 px-2 py-1.5 rounded-md bg-white border border-slate-900/[0.08] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/60 transition-all">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 px-2 h-6 rounded-md bg-slate-100 text-slate-700 text-[11.5px] font-medium"
        >
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="text-slate-400 hover:text-rose-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="flex-1 min-w-[120px] h-7 bg-transparent outline-none text-[13px] text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}
