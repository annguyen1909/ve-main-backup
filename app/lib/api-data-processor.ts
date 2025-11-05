import { WorkResource } from "~/types/works";

// Define types for the API data processor
export type ImageType = 'Hero' | 'Aerial' | 'Exterior' | 'Interior' | 'Detail' | 'Concept';

export interface OrganizedProjectImage {
  id: string;
  url: string;
  title: string;
  description: string;
  type: ImageType;
  // mediaType distinguishes between static images and video assets
  mediaType: 'image' | 'video';
  // when mediaType === 'video' this contains the playable URL
  videoUrl: string | null;
  tags: string[];
}

export interface OrganizedProject {
  title: string;
  description: string;
  images: OrganizedProjectImage[];
  totalImages: number;
}

// Group works by project name (removing duplicate variations)
export function groupWorksByProject(works: WorkResource[]): OrganizedProject[] {
  const projectMap = new Map<string, WorkResource[]>();

  // Group works by normalized project title
  works.forEach(work => {
    const normalizedTitle = normalizeProjectTitle(work.title);
    
    if (!projectMap.has(normalizedTitle)) {
      projectMap.set(normalizedTitle, []);
    }
    projectMap.get(normalizedTitle)!.push(work);
  });

  // Convert to OrganizedProject format
  const organizedProjectsWithKey: { project: OrganizedProject; key: string }[] = [];

  projectMap.forEach((projectWorks, projectTitle) => {
    // Sort works within project (video first, then by type)
    const sortedWorks = sortWorksWithinProject(projectWorks);

    const images = sortedWorks.map(work => {
  // Normalize link_video: some API responses include the string "null" instead of null
  const linkVideo = (typeof work.link_video === 'string' && work.link_video !== '' && work.link_video !== 'null') ? work.link_video : null;

  // Check both optimized and raw attachment URLs for video file extensions (prefer the raw attachment if it is a video)
  const optimizeCandidate = String(work.optimize_attachment_url || '');
  const attachmentCandidate = String(work.attachment_url || '');
  const isOptimizeVideo = /\.(mp4|webm|m3u8)(\?|$)/i.test(optimizeCandidate);
  const isAttachmentVideo = /\.(mp4|webm|m3u8)(\?|$)/i.test(attachmentCandidate);

      // Prefer server-hosted attachment video (raw) first, then optimized attachment video, then explicit link_video
      let resolvedVideoUrl: string | null = null;
      if (isAttachmentVideo) {
        resolvedVideoUrl = attachmentCandidate;
      } else if (isOptimizeVideo) {
        resolvedVideoUrl = optimizeCandidate;
      } else if (linkVideo) {
        resolvedVideoUrl = linkVideo;
      }

      return {
        id: work.slug,
        // use the optimized attachment as the poster/thumbnail
        url: work.optimize_attachment_url || work.attachment_url,
        mediaType: (resolvedVideoUrl ? 'video' : 'image') as 'video' | 'image',
        videoUrl: resolvedVideoUrl ?? null,
        title: work.title,
        description: work.description,
        type: detectImageTypeFromWork(work),
        tags: work.tags.map(tag => tag.name.en)
      };
    });

    const projectObj: OrganizedProject = {
      title: projectTitle,
      description: sortedWorks[0]?.description ?? '',
      images,
      totalImages: images.length
    };

    // Representative key for sorting: prefer the first work's slug, fallback to normalized title
    const representativeKey = (sortedWorks[0] && sortedWorks[0].slug) ? sortedWorks[0].slug : projectTitle;

    organizedProjectsWithKey.push({ project: projectObj, key: representativeKey });
  });

  // Sort projects by representative key (slug/ID) alphabetically (A → Z)
  organizedProjectsWithKey.sort((a, b) => a.key.localeCompare(b.key, undefined, { sensitivity: 'base' }));

  return organizedProjectsWithKey.map((p) => p.project);
}

// Normalize project titles to group similar variations
function normalizeProjectTitle(title: string): string {
  // Remove trailing numbers, hyphens, and IDs
  const normalized = title
    .replace(/-\d+$/, '') // Remove trailing -123
    .replace(/\s+\d+$/, '') // Remove trailing numbers
    .trim();

  // Handle special cases
  const specialCases: Record<string, string> = {
    'Dongdeamun Design Plaza': 'Dongdaemun Design Plaza',
    'Dongdaemun Design Plaza': 'Dongdaemun Design Plaza',
    'VE Residence Building': 'VE Residence Building',
    'Lom.Haijai Residences': 'Lom.Haijai Residences',
    'A-Frame Evolution': 'A-Frame Evolution',
    'Modern Apartment': 'Modern Apartment',
    'Tropical House': 'Tropical House',
    'AMOS Lobby Renovation': 'AMOS Lobby Renovation',
    'Wedding Hall Renovation': 'Wedding Hall Renovation',
    'T.K E&C Aerial View': 'T.K E&C Aerial View',
    'Geoje Island Café': 'Geoje Island Café',
    'Daemyoung Energy': 'Daemyoung Energy',
    'RIV Office': 'RIV Office',
    'Office Center': 'Office Center',
    'Solar Panel Balcony': 'Solar Panel Balcony',
    'Car Parking Lot': 'Car Parking Lot',
    'Ino Block': 'Ino Block',
    'Complex apartment': 'Complex Apartment',
    'Osan apartment': 'Osan Apartment',
    'S-Factory': 'S-Factory'
  };

  return specialCases[normalized] || normalized;
}

// Sort works within a project (videos first, then by image type priority)
function sortWorksWithinProject(works: WorkResource[]): WorkResource[] {
  const typePriority: Record<ImageType, number> = {
    'Hero': 1,
    'Aerial': 2,
    'Exterior': 3,
    'Interior': 4,
    'Detail': 5,
    'Concept': 6
  };

  return works.sort((a, b) => {
    // Videos first
    if (a.link_video && !b.link_video) return -1;
    if (!a.link_video && b.link_video) return 1;

    // Then by type priority
    const aType = detectImageTypeFromWork(a);
    const bType = detectImageTypeFromWork(b);
    
    return typePriority[aType] - typePriority[bType];
  });
}

// Detect image type from work tags and title
function detectImageTypeFromWork(work: WorkResource): ImageType {
  const tags = work.tags.map(tag => tag.name.en.toLowerCase());
  const title = work.title.toLowerCase();

  // Check tags first
  if (tags.includes('aerial')) return 'Aerial';
  if (tags.includes('exterior')) return 'Exterior';
  if (tags.includes('interior')) return 'Interior';

  // Check title patterns
  if (title.includes('aerial') || title.includes('bird')) return 'Aerial';
  if (title.includes('exterior') || title.includes('outside') || title.includes('facade')) return 'Exterior';
  if (title.includes('interior') || title.includes('inside') || title.includes('room')) return 'Interior';
  if (title.includes('detail') || title.includes('close')) return 'Detail';
  if (title.includes('concept') || title.includes('sketch')) return 'Concept';

  // Default to Hero for main project images
  return 'Hero';
}

// Transform raw API response to work with existing image organization
export function transformApiResponse(apiData: { data: WorkResource[] }): WorkResource[] {
  return apiData.data;
}

// Get project title suggestions for search/filtering
export function getProjectTitleSuggestions(works: WorkResource[]): string[] {
  const titles = new Set<string>();
  
  works.forEach(work => {
    titles.add(normalizeProjectTitle(work.title));
  });

  return Array.from(titles).sort();
}

// Filter works by category
export function filterWorksByCategory(works: WorkResource[], categorySlug?: string): WorkResource[] {
  if (!categorySlug || categorySlug === 'all') {
    return works;
  }
  
  return works.filter(work => work.category.slug === categorySlug);
}

// Filter works by tag
export function filterWorksByTag(works: WorkResource[], tagId?: string): WorkResource[] {
  if (!tagId) {
    return works;
  }
  
  return works.filter(work => 
    work.tags.some(tag => tag.id.toString() === tagId)
  );
}

// Search works by keywords
export function searchWorks(works: WorkResource[], query?: string): WorkResource[] {
  if (!query || query.trim() === '') {
    return works;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return works.filter(work => 
    work.title.toLowerCase().includes(searchTerm) ||
    work.description.toLowerCase().includes(searchTerm) ||
    work.tags.some(tag => 
      tag.name.en.toLowerCase().includes(searchTerm) || 
      tag.name.ko.toLowerCase().includes(searchTerm)
    )
  );
}