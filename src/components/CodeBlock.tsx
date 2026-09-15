import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Basic syntax tokenization for keywords and comments for visual elegance
  const highlightSyntax = (rawCode: string) => {
    const lines = rawCode.split('\n');
    return lines.map((line, idx) => {
      // Highlight comments
      if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
        return (
          <div key={idx} className="text-[#8E8880] italic">
            {line}
          </div>
        );
      }
      return (
        <div key={idx} className="leading-relaxed">
          {line || ' '}
        </div>
      );
    });
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#383530] bg-[#1E1D1A] text-[#EAE6DF] shadow-md">
      {/* Code block header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#262420] border-b border-[#383530] text-xs">
        <span className="font-mono text-[#B0ABA1] font-medium tracking-wide lowercase">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#B0ABA1] hover:text-white hover:bg-[#34322C] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C96442]"
          title="Copy code"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#7A9A76]" />
              <span className="text-[#7A9A76]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto font-mono text-[13.5px] leading-relaxed select-text">
        <pre className="font-mono">{highlightSyntax(code)}</pre>
      </div>
    </div>
  );
};
