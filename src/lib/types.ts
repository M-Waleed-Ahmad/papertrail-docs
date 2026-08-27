export type RichTextDocument = {
  type: "doc";
  content: Array<Record<string, unknown>>;
};

export type Profile = {
  id: string;
  display_name: string;
  email: string;
};

export type DocumentRow = {
  id: string;
  owner_id: string;
  title: string;
  content: RichTextDocument;
  plain_text: string;
  source_type: "blank" | "txt" | "markdown";
  original_name: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentMember = {
  document_id: string;
  user_id: string;
  role: "editor";
  created_at: string;
};

export const emptyDocument: RichTextDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
