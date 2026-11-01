import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../components/ui/utils';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  TextCursorInput,
  Type,
  Underline,
  Undo2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ToolbarButton = ({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onClick}
    className="h-8 px-2 border-slate-200/70 bg-white hover:bg-slate-50"
    aria-label={label}
    title={label}
  >
    <Icon className="h-4 w-4 text-slate-600" />
  </Button>
);

export function RichTextEditor({ value, onChange, placeholder, className, style }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);
  const selectionRef = useRef<Range | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [textColor, setTextColor] = useState('#111827');
  const [highlightColor, setHighlightColor] = useState('#fef3c7');

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
    lastValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (style?.fontFamily) {
      editorRef.current.style.fontFamily = style.fontFamily;
    } else {
      editorRef.current.style.removeProperty('font-family');
    }
  }, [style?.fontFamily]);

  const removeFontStylesFromDOM = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
      if (el.style.fontFamily) {
        el.style.fontFamily = '';
        if (!el.getAttribute('style')?.trim()) {
          el.removeAttribute('style');
        }
      }
    });
  };

  const sanitizeFontFamily = (html: string) =>
    html.replace(/font-family\s*:\s*[^;]+;?/gi, '');

  const emitChange = () => {
    removeFontStylesFromDOM();
    const editor = editorRef.current;
    if (!editor) return;
    const rawHtml = editor.innerHTML;
    const cleaned = sanitizeFontFamily(rawHtml);
    if (cleaned !== rawHtml) {
      editor.innerHTML = cleaned;
    }
    lastValueRef.current = cleaned;
    onChange(cleaned);
  };

  const applyCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    emitChange();
  };

  const applyColor = (command: 'foreColor' | 'hiliteColor', color: string) => {
    document.execCommand(command, false, color);
    editorRef.current?.focus();
    emitChange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selectionRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  };

  const insertHtmlAtSelection = (html: string) => {
    editorRef.current?.focus();
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    range.insertNode(fragment);
    emitChange();
  };

  const insertImage = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
    setImageDialogOpen(true);
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    insertHtmlAtSelection(
      `<img src="${imageUrl.trim()}" alt="Story image" style="max-width: 100%; border-radius: 12px; margin: 12px 0;" />`
    );
    setImageDialogOpen(false);
    setImageUrl('');
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const openLinkDialog = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
    // Pre-fill the display text with whatever the admin currently has selected
    // (e.g. "Elon Musk"), so the link can sit behind that text.
    setLinkText(selection?.toString() || '');
    setLinkUrl('');
    setLinkDialogOpen(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.trim();
    const text = (linkText.trim() || url);
    insertHtmlAtSelection(
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`
    );
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertInlineCode = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || 'code';
    insertHtmlAtSelection(`<code>${text}</code>`);
  };

  const isEmpty = !value || value === '<p><br></p>';

  return (
    <div className={cn('rounded-2xl border border-slate-200/70 bg-white shadow-sm', className)} style={style}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/70 bg-slate-50/80 px-3 py-2">
        <ToolbarButton onClick={() => applyCommand('formatBlock', 'p')} icon={Type} label="Paragraph" />
        <ToolbarButton onClick={() => applyCommand('formatBlock', 'h1')} icon={Heading1} label="Heading 1" />
        <ToolbarButton onClick={() => applyCommand('formatBlock', 'h2')} icon={Heading2} label="Heading 2" />
        <ToolbarButton onClick={() => applyCommand('formatBlock', 'h3')} icon={Heading3} label="Heading 3" />
        <ToolbarButton onClick={() => applyCommand('formatBlock', 'h4')} icon={Heading4} label="Heading 4" />
        <ToolbarButton onClick={() => applyCommand('bold')} icon={Bold} label="Bold" />
        <ToolbarButton onClick={() => applyCommand('italic')} icon={Italic} label="Italic" />
        <ToolbarButton onClick={() => applyCommand('underline')} icon={Underline} label="Underline" />
        <ToolbarButton onClick={() => applyCommand('strikeThrough')} icon={Strikethrough} label="Strikethrough" />
        <ToolbarButton onClick={insertInlineCode} icon={Code} label="Inline code" />
        <ToolbarButton onClick={() => applyCommand('formatBlock', 'pre')} icon={TextCursorInput} label="Code block" />
        <ToolbarButton onClick={() => applyCommand('insertUnorderedList')} icon={List} label="Bullet list" />
        <ToolbarButton onClick={() => applyCommand('insertOrderedList')} icon={ListOrdered} label="Numbered list" />
        <ToolbarButton onClick={() => applyCommand('formatBlock', 'blockquote')} icon={Quote} label="Quote" />
        <ToolbarButton onClick={insertImage} icon={ImageIcon} label="Insert image" />
        <ToolbarButton onClick={openLinkDialog} icon={Link2} label="Insert link" />
        <ToolbarButton onClick={() => applyCommand('unlink')} icon={Link2Off} label="Remove link" />
        <ToolbarButton onClick={() => applyCommand('insertHorizontalRule')} icon={Minus} label="Divider" />
        <ToolbarButton onClick={() => applyCommand('undo')} icon={Undo2} label="Undo" />
        <ToolbarButton onClick={() => applyCommand('redo')} icon={Redo2} label="Redo" />
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span className="hidden sm:inline">Text</span>
          <input
            type="color"
            value={textColor}
            onChange={(event) => {
              setTextColor(event.target.value);
              applyColor('foreColor', event.target.value);
            }}
            className="h-8 w-8 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
            aria-label="Text color"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span className="hidden sm:inline">Highlight</span>
          <input
            type="color"
            value={highlightColor}
            onChange={(event) => {
              setHighlightColor(event.target.value);
              applyColor('hiliteColor', event.target.value);
            }}
            className="h-8 w-8 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
            aria-label="Highlight color"
          />
        </label>
      </div>
      <div className="relative">
        {isEmpty ? (
          <div className="pointer-events-none absolute inset-0 p-5 text-sm text-slate-400">
            {placeholder || 'Start writing...'}
          </div>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[320px] px-5 py-4 text-sm text-slate-800 leading-relaxed focus:outline-none [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-slate-900 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-[var(--color-navy-600)] [&_a]:underline"
          onInput={emitChange}
          onBlur={emitChange}
          onKeyUp={() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              selectionRef.current = selection.getRangeAt(0);
            }
          }}
          onMouseUp={() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              selectionRef.current = selection.getRangeAt(0);
            }
          }}
        />
      </div>
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add image</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="editor-image-url">Image URL</Label>
            <Input
              id="editor-image-url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleInsertImage}>
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editor-link-text">Text to display</Label>
              <Input
                id="editor-link-text"
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
                placeholder="Elon Musk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editor-link-url">Link URL</Label>
              <Input
                id="editor-link-url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://en.wikipedia.org/wiki/Elon_Musk"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleInsertLink}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
