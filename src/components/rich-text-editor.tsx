"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import type { RichTextDocument } from "@/lib/types";

type Props = { initialContent: RichTextDocument; onChange: (content: RichTextDocument) => void; editable: boolean };

function ToolButton({ active, label, onClick, disabled }: { active?: boolean; label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className={active ? "tool active" : "tool"} aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick} disabled={disabled}>{label}</button>;
}

export function RichTextEditor({ initialContent, onChange, editable }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } }), Underline],
    content: initialContent,
    editorProps: { attributes: { class: "editor-prose", "aria-label": "Document content" } },
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as RichTextDocument),
  });

  useEffect(() => { editor?.setEditable(editable); }, [editor, editable]);
  if (!editor) return <div className="editor-loading">Loading editor…</div>;

  return <>
    <div className="toolbar" role="toolbar" aria-label="Formatting controls">
      <ToolButton label="B" active={editor.isActive("bold")} disabled={!editable} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolButton label="I" active={editor.isActive("italic")} disabled={!editable} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolButton label="U" active={editor.isActive("underline")} disabled={!editable} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <span className="toolbar-rule" />
      <ToolButton label="H1" active={editor.isActive("heading", { level: 1 })} disabled={!editable} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolButton label="H2" active={editor.isActive("heading", { level: 2 })} disabled={!editable} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <span className="toolbar-rule" />
      <ToolButton label="• List" active={editor.isActive("bulletList")} disabled={!editable} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolButton label="1. List" active={editor.isActive("orderedList")} disabled={!editable} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <span className="toolbar-rule" />
      <ToolButton label="↶" disabled={!editable || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
      <ToolButton label="↷" disabled={!editable || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
    </div>
    <div className="document-sheet"><EditorContent editor={editor} /></div>
  </>;
}
