import DOMPurify from 'dompurify';

const URL_REGEX = /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/g;
const MD_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

export function linkifyHtml(text) {
  if (!text) return '';

  // First, handle markdown-style links [text](url)
  let result = text.replace(MD_LINK_REGEX, (_, label, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#6B46C1;text-decoration:underline;">${label}</a>`;
  });

  // Then handle bare URLs (but not ones already inside an href or <a> tag)
  result = result.replace(URL_REGEX, (match, _p1, _p2, offset) => {
    // Check if this URL is already inside an href="" or <a> tag
    const before = result.slice(Math.max(0, offset - 10), offset);
    if (before.includes('href="') || before.includes('">')) return match;

    const href = match.startsWith('www.') ? `https://${match}` : match;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#6B46C1;text-decoration:underline;">${match}</a>`;
  });

  return typeof window !== 'undefined' ? DOMPurify.sanitize(result) : result;
}
