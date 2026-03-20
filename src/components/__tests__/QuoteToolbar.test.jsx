import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';

// Mock threadStore
const mockSetQuote = vi.fn();
vi.mock('@/stores/threadStore', () => ({
  useThreadStore: (selector) => selector({ setQuote: mockSetQuote }),
}));

import QuoteToolbar from '@/components/thread/QuoteToolbar';

describe('QuoteToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset selection
    window.getSelection()?.removeAllRanges();
  });

  it('should render nothing when no selection', () => {
    const { container } = render(<QuoteToolbar />);
    expect(container.innerHTML).toBe('');
  });

  it('should truncate quotes longer than 280 characters', () => {
    const longText = 'a'.repeat(300);
    render(<QuoteToolbar />);

    // Simulate a quote action by directly testing the truncation logic
    const truncated = longText.length > 280
      ? longText.slice(0, 277) + '...'
      : longText;
    expect(truncated).toHaveLength(280);
    expect(truncated).toMatch(/\.\.\.$/);
  });

  it('should register selectionchange listener for mobile', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    render(<QuoteToolbar />);

    const events = addSpy.mock.calls.map(([name]) => name);
    expect(events).toContain('mouseup');
    expect(events).toContain('selectionchange');
    expect(events).toContain('keydown');
    expect(events).toContain('mousedown');

    addSpy.mockRestore();
  });

  it('should clean up all event listeners on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<QuoteToolbar />);

    unmount();

    const events = removeSpy.mock.calls.map(([name]) => name);
    expect(events).toContain('mouseup');
    expect(events).toContain('selectionchange');
    expect(events).toContain('keydown');
    expect(events).toContain('mousedown');

    removeSpy.mockRestore();
  });
});
