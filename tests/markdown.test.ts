import { describe, expect, it } from "vitest";
import { importFile, markdownToDocument, textToDocument } from "@/lib/markdown";

describe("document import", () => {
  it("converts common Markdown formatting into TipTap JSON", () => {
    const document = markdownToDocument("# Launch plan\n\n**Owner:** Maya\n\n- Prepare brief\n- Share draft\n\n1. Review\n2. Publish");
    expect(document.content).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "heading", attrs: { level: 1 } }),
      expect.objectContaining({ type: "bulletList" }),
      expect.objectContaining({ type: "orderedList" }),
    ]));
    expect(JSON.stringify(document)).toContain('"type":"bold"');
  });

  it("rejects unsupported and oversized uploads", () => {
    expect(() => importFile(new File(["hello"], "notes.docx"))).toThrow("Only .txt and .md files are supported.");
    expect(() => importFile(new File([new Uint8Array(1024 * 1024 + 1)], "notes.txt"))).toThrow("Files must be smaller than 1 MB.");
  });

  it("turns plain text into editable paragraphs", () => {
    const document = textToDocument("First thought\n\nSecond thought");
    expect(document.content).toHaveLength(2);
    expect(document.content[0]).toMatchObject({ type: "paragraph" });
  });
});
