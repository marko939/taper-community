import React from 'react';
import { linkifyHtml } from './linkify';

function LinkifiedText({ text }) {
  const html = linkifyHtml(text);
  if (html !== text) {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return text;
}

export function renderBodyWithQuotes(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let quoteLines = [];
  let key = 0;

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    const content = quoteLines.map((l) => l.replace(/^>\s?/, '')).join('\n');
    elements.push(
      <blockquote
        key={key++}
        className="my-2 whitespace-pre-wrap rounded-r-lg py-2 pl-4 pr-3 text-sm italic"
        style={{
          borderLeft: '4px solid var(--purple)',
          background: 'rgba(107, 70, 193, 0.05)',
          color: 'var(--text-muted)',
        }}
      >
        <LinkifiedText text={content} />
      </blockquote>
    );
    quoteLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('> ') || lines[i] === '>') {
      quoteLines.push(lines[i]);
    } else {
      flushQuote();
      elements.push(
        <React.Fragment key={key++}>
          <LinkifiedText text={lines[i]} />
          {i < lines.length - 1 ? '\n' : ''}
        </React.Fragment>
      );
    }
  }
  flushQuote();

  return elements;
}
