interface WorkTag {
  id: number;
  name: TitleTranslations;
  group: string;
  created_at: string;
  updated_at: string;
  pivot: {
    taggable_type: string;
    taggable_id: number;
    tag_id: number;
  };
}

interface WorkResource {
  attachment: unknown;
  title: string;
  slug: string;
  link_video: string | null;
  description: string;
  category: Category;
  optimize_attachment_url: string;
  attachment_url: string;
  tags: WorkTag[];
}

interface Category {
  id: number;
  parent_id: number | null;
  title: TitleTranslations;
  slug: string;
  description: TitleTranslations;
  group: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface TitleTranslations {
  en: string;
  ko: string;
}

export type { WorkResource, WorkTag, Category, TitleTranslations };