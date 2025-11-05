interface CategoryResource {
  translations: Translations;
  title: string;
  slug: string;
  description: string;
  attachment_url: string;
}

// interface Attachment {
//     id: number;
//     path: string;
//     mime_type: string;
//     size: number;
//     attachmentable_type: string;
//     attachmentable_id: number;
//     type: string;
//     user_id: number;
//     meta: any;
//     translation: any;
//     created_at: string;
//     updated_at: string;
//     url: string;
// }

interface Translations {
  title: Record<string, string>;
  slug: Record<string, string>;
  description: Record<string, string>;
}

export type { CategoryResource };