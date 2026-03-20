import { describe, it, expect, vi } from 'vitest';
import { makeImagePasteHandler, makeImageDropHandler, preventDefaultDrag } from '@/components/shared/FormattingToolbar';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/image.png' } }),
      }),
    },
  }),
}));

describe('makeImagePasteHandler', () => {
  it('should ignore paste events with no image items', async () => {
    const onChange = vi.fn();
    const setUploading = vi.fn();
    const textareaRef = { current: { selectionStart: 0, value: '', focus: vi.fn() } };

    const handler = makeImagePasteHandler(textareaRef, () => '', onChange, setUploading);

    const event = {
      clipboardData: {
        items: [{ type: 'text/plain', getAsFile: () => null }],
      },
      preventDefault: vi.fn(),
    };

    await handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should handle paste events with image items', async () => {
    const onChange = vi.fn();
    const setUploading = vi.fn();
    const textareaRef = { current: { selectionStart: 0, value: '', focus: vi.fn() } };

    const handler = makeImagePasteHandler(textareaRef, () => '', onChange, setUploading);

    const mockFile = new File(['pixels'], 'test.png', { type: 'image/png' });
    Object.defineProperty(mockFile, 'size', { value: 1024 });

    const event = {
      clipboardData: {
        items: [{ type: 'image/png', getAsFile: () => mockFile }],
      },
      preventDefault: vi.fn(),
    };

    await handler(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(setUploading).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalled();
    // The onChange value should contain markdown image syntax
    const calledWith = onChange.mock.calls[0][0];
    expect(calledWith).toContain('![image]');
  });

  it('should reject images over 5MB', async () => {
    const onChange = vi.fn();
    const setUploading = vi.fn();
    const textareaRef = { current: { selectionStart: 0, value: '', focus: vi.fn() } };
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const handler = makeImagePasteHandler(textareaRef, () => '', onChange, setUploading);

    const mockFile = new File(['pixels'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(mockFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB

    const event = {
      clipboardData: {
        items: [{ type: 'image/png', getAsFile: () => mockFile }],
      },
      preventDefault: vi.fn(),
    };

    await handler(event);
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('5MB'));
    expect(onChange).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

describe('makeImageDropHandler', () => {
  it('should ignore non-image drops', async () => {
    const onChange = vi.fn();
    const setUploading = vi.fn();
    const textareaRef = { current: { selectionStart: 0, value: '', focus: vi.fn() } };

    const handler = makeImageDropHandler(textareaRef, () => '', onChange, setUploading);

    const event = {
      dataTransfer: {
        files: [new File(['data'], 'doc.pdf', { type: 'application/pdf' })],
      },
      preventDefault: vi.fn(),
    };

    await handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('preventDefaultDrag', () => {
  it('should prevent default for file drags', () => {
    const event = {
      dataTransfer: { types: ['Files'] },
      preventDefault: vi.fn(),
    };
    preventDefaultDrag(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not prevent default for non-file drags', () => {
    const event = {
      dataTransfer: { types: ['text/plain'] },
      preventDefault: vi.fn(),
    };
    preventDefaultDrag(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
