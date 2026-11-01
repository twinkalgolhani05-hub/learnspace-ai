import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Normalizes math delimiters, LaTeX expressions, and common algorithmic notations
 * so KaTeX and ReactMarkdown render them smoothly without raw markdown or LaTeX artifacts.
 */
export const normalizeMathText = (raw = '', { stripPrefix = false } = {}) => {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw.trim();

  // Strip leading option prefixes like "A) ", "(A) ", "A. ", "Option A: ", "A "
  if (stripPrefix) {
    text = text
      .replace(/^(?:Option\s+[A-D]\s*[:.-]?\s*|[A-D]\s*[:.)-]\s*|\([A-D]\)\s*|[A-D]\s+(?=[$A-Za-z0-9]))/i, '')
      .trim();
  }

  // Convert LaTeX delimiters \( ... \) and \[ ... \] to $ ... $ and $$ ... $$
  text = text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `\n$$${eq}$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq}$`);

  // Auto-detect unwrapped Big-O / Omega / Theta notations like O(n), O(log n), O(1), O(n log n)
  // Only convert if NOT already inside a dollar sign
  text = text.replace(/(^|[^$\w\\])(O|Omega|Theta)\s*\(\s*([^$)\n]+)\s*\)/g, (match, prefix, symbol, expr) => {
    let mathSym = 'O';
    if (symbol.toLowerCase() === 'omega') mathSym = '\\Omega';
    if (symbol.toLowerCase() === 'theta') mathSym = '\\Theta';

    let cleanExpr = expr
      .replace(/\blog\s+([a-zA-Z0-9]+)\b/gi, '\\log $1')
      .replace(/\blog\b/gi, '\\log')
      .replace(/\*/g, ' \\cdot ')
      .trim();

    return `${prefix}$${mathSym}(${cleanExpr})$`;
  });

  // Convert unwrapped inline standalone variables like "with n nodes" to "$n$ nodes" when surrounded by word boundaries
  text = text.replace(/(\b(?:with|for|where|having)\s+)([nkvm])(\s+(?:nodes|elements|vertices|edges|items)\b)/gi, '$1$$$2$$$3');

  // Fix escaped backslashes in math like \\log -> \log
  text = text.replace(/\$(\\+)([a-zA-Z]+)/g, (_, slashes, cmd) => `$\\${cmd}`);

  return text;
};

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [
  [
    rehypeKatex,
    {
      throwOnError: false,
      strict: false,
      output: 'htmlAndMathml',
    },
  ],
];

/**
 * QuizMathText renders questions, options, and explanations with full KaTeX math support
 * and GFM markdown.
 */
const QuizMathText = memo(({ content, inline = false, stripPrefix = false, className = '' }) => {
  const normalized = normalizeMathText(content, { stripPrefix });

  const customComponents = {
    // If inline mode (e.g. inside a button or list pill), do not emit block <p> elements
    p: ({ children }) => (inline ? <span>{children}</span> : <p className="quiz-math-p">{children}</p>),
    pre: ({ children }) => <pre className="quiz-code-pre">{children}</pre>,
    code: ({ inline: isCodeInline, children, ...props }) =>
      isCodeInline ? (
        <code className="quiz-inline-code" {...props}>
          {children}
        </code>
      ) : (
        <code className="quiz-block-code" {...props}>
          {children}
        </code>
      ),
  };

  return (
    <span className={`quiz-math-container ${inline ? 'quiz-math-inline' : 'quiz-math-block'} ${className}`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={customComponents}
      >
        {normalized}
      </ReactMarkdown>
    </span>
  );
});

QuizMathText.displayName = 'QuizMathText';

export default QuizMathText;
