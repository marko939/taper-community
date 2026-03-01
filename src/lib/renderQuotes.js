import React from 'react';
import { linkifyHtml } from './linkify';

const MD_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;
const MD_BOLD_REGEX = /\*\*(.+?)\*\*/g;
const MD_ITALIC_REGEX = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g;

function formatInlineMarkdown(text) {
  // Process images first, then bold, then italic
  let html = text.replace(MD_IMAGE_REGEX, (_match, _alt, src) => {
    return `<img src="${src}" alt="user image" class="post-image" data-lightbox="true" style="max-width:100%;border-radius:8px;margin:8px 0;cursor:pointer;" />`;
  });
  html = html.replace(MD_BOLD_REGEX, '<strong>$1</strong>');
  html = html.replace(MD_ITALIC_REGEX, '<em>$1</em>');
  return html;
}

function RichText({ text }) {
  const linked = linkifyHtml(text);
  const formatted = formatInlineMarkdown(linked);
  if (formatted !== text) {
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  }
  return text;
}

export function renderBodyWithQuotes(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let quoteLines = [];
  let bulletLines = [];
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
        <RichText text={content} />
      </blockquote>
    );
    quoteLines = [];
  };

  const flushBullets = () => {
    if (bulletLines.length === 0) return;
    elements.push(
      <ul key={key++} className="my-2 list-disc pl-5 text-sm" style={{ color: 'var(--text-muted)' }}>
        {bulletLines.map((line, i) => (
          <li key={i} className="py-0.5">
            <RichText text={line.replace(/^-\s/, '')} />
          </li>
        ))}
      </ul>
    );
    bulletLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('> ') || line === '>') {
      flushBullets();
      quoteLines.push(line);
    } else if (line.startsWith('- ')) {
      flushQuote();
      bulletLines.push(line);
    } else {
      flushQuote();
      flushBullets();
      elements.push(
        <React.Fragment key={key++}>
          <RichText text={line} />
          {i < lines.length - 1 ? '\n' : ''}
        </React.Fragment>
      );
    }
  }
  flushQuote();
  flushBullets();

  return elements;
}
