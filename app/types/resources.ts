export type ResourceCollectionWithPagination<TResource> = {
  data: Array<TResource>;
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
};

export type ResourceCollection<TResource> = {
  data: Array<TResource>;
};

export type Resource<TResource> = {
  data: TResource;
};

export type Attachment = {
  url: string;
  description: string;
};

export type Configuration = {
  brand: Resource<Attachment>;
};
