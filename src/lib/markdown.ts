import type { RichTextDocument } from "@/lib/types";

const text = (value: string, marks?: Array<{ type: string }>) => ({ type: "text", text: value, ...(marks?.length ? { marks } : {}) });

function inline(value: string) {
  const pieces: Array<Record<string, unknown>> = [];
  const expression = /(\*\*([^*]+)\*\*|_([^_]+)_)/g;
  let cursor = 0;
  for (const match of value.matchAll(expression)) {
    if (match.index! > cursor) pieces.push(text(value.slice(cursor, match.index)));
    pieces.push(match[2] ? text(match[2], [{ type: "bold" }]) : text(match[3], [{ type: "italic" }]));
    cursor = match.index! + match[0].length;
  }
  if (cursor < value.length) pieces.push(text(value.slice(cursor)));
  return pieces;
}

export function textToDocument(value: string): RichTextDocument {
  const content = value.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((paragraph) => ({
    type: "paragraph",
    content: paragraph.trim() ? [text(paragraph.trim())] : [],
  }));
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export function markdownToDocument(value: string): RichTextDocument {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const content: Array<Record<string, unknown>> = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      content.push({ type: "heading", attrs: { level: heading[1].length }, content: inline(heading[2]) });
      index += 1;
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || numbered) {
      const expression = numbered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
      const items: Array<Record<string, unknown>> = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(expression);
        if (!item) break;
        items.push({ type: "listItem", content: [{ type: "paragraph", content: inline(item[1]) }] });
        index += 1;
      }
      content.push({ type: numbered ? "orderedList" : "bulletList", content: items });
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s+|^[-*]\s+|^\d+\.\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    content.push({ type: "paragraph", content: inline(paragraph.join(" ")) });
  }
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export function documentPlainText(document: RichTextDocument) {
  const visit = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    const value = node as { text?: string; content?: unknown[] };
    return value.text ?? value.content?.map(visit).join("\n") ?? "";
  };
  return visit(document).replace(/\n{3,}/g, "\n\n").trim();
}

export function importFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["txt", "md"].includes(extension)) throw new Error("Only .txt and .md files are supported.");
  if (file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > 1024 * 1024) throw new Error("Files must be smaller than 1 MB.");
  return { extension: extension as "txt" | "md", title: file.name.replace(/\.(txt|md)$/i, "") || "Untitled document" };
}
