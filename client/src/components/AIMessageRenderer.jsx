import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Normalizes common LaTeX delimiters (\( ... \) and \[ ... \]) into standard
 * $ ... $ and $$ ... $$ delimiters so remark-math and rehype-katex parse them reliably.
 */
const normalizeMathDelimiters = (raw = '') => {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `\n$$${eq}$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq}$`);
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

const MarkdownComponents = {
  table: ({ children }) => (
    <div className="ai-table-scroll">
      <table className="ai-markdown-table">{children}</table>
    </div>
  ),
  pre: ({ children }) => <pre className="chat-code-block">{children}</pre>,
  code: ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const text = String(children).replace(/\n$/, '');
    const isBlock = !inline && (match || text.includes('\n'));

    if (isBlock) {
      return (
        <code className={className || ''} {...props}>
          {text}
        </code>
      );
    }
    return (
      <code className="chat-inline-code" {...props}>
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="ai-blockquote">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ai-link">
      {children}
    </a>
  ),
};

const AIMessageRenderer = memo(({ content }) => {
  const normalized = normalizeMathDelimiters(content);

  return (
    <div className="ai-markdown-body">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={MarkdownComponents}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
});

AIMessageRenderer.displayName = 'AIMessageRenderer';

export default AIMessageRenderer;

