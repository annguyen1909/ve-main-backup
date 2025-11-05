interface ClientResource {
  id: number;
  translations: Translations;
  name: string;
  published_at: Date;
  attachment_url: string
}

interface Attachment {
  id: number;
  path: string;
  mime_type: string;
  size: number;
  attachmentable_type: string;
  attachmentable_id: number;
  type: string;
  user_id: number;
  meta: any;
  translation: any;
  created_at: string;
  updated_at: string;
  url: string;
}

interface Translations {
  name: Record<string, string>;
}

export type { ClientResource, Attachment };