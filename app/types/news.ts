interface NewsResource {
  title: string;
  description: string | null;
  slug: string;
  content: string;
  optimize_attachment_url: string | null;
  attachment_url: string,
  published_at: string;
}

export type { NewsResource }