import { WorkResource } from "~/types/works";

export interface OrganizedImage {
  id: string | number;
  url: string;
  type: 'featured' | 'render' | 'sketch' | 'process' | 'detail' | 'other';
  order: number;
  title?: string;
  isOptimized?: boolean;
}

export interface ImageGroup {
  featured: OrganizedImage | null;
  renders: OrganizedImage[];
  sketches: OrganizedImage[];
  process: OrganizedImage[];
  other: OrganizedImage[];
  all: OrganizedImage[];
}

/**
 * Organizes work images by type based on filename patterns and metadata
 */
export function organizeWorkImages(work: WorkResource): ImageGroup {
  const allImages: OrganizedImage[] = [];

  // Add featured image first
  if (work.attachment_url || work.optimize_attachment_url) {
    allImages.push({
      id: 'featured',
      url: work.optimize_attachment_url || work.attachment_url,
      type: 'featured',
      order: 0,
      title: `${work.title} - Featured`,
      isOptimized: !!work.optimize_attachment_url
    });
  }

  // Add attachment images with smart type detection
  if (Array.isArray(work.attachment)) {
    work.attachment.forEach((img: { path: string; id: unknown; url: unknown; }, index: number) => {
      const imageType = detectImageType(img.path);
      allImages.push({
        id: img.id as string | number,
        url: typeof img.url === 'string' ? img.url : '',
        type: imageType,
        order: index + 1,
        title: generateImageTitle(work.title, imageType, index + 1),
        isOptimized: false
      });
    });
  }

  // Sort by order
  allImages.sort((a, b) => a.order - b.order);

  // Group by type
  const grouped: ImageGroup = {
    featured: allImages.find(img => img.type === 'featured') || null,
    renders: allImages.filter(img => img.type === 'render'),
    sketches: allImages.filter(img => img.type === 'sketch'),
    process: allImages.filter(img => img.type === 'process'),
    other: allImages.filter(img => !['featured', 'render', 'sketch', 'process'].includes(img.type)),
    all: allImages
  };

  return grouped;
}

/**
 * Detects image type based on filename patterns
 */
function detectImageType(filename: string): OrganizedImage['type'] {
  const lowerPath = filename.toLowerCase();
  
  // Render patterns
  if (lowerPath.includes('render') || 
      lowerPath.includes('final') || 
      lowerPath.includes('exterior') || 
      lowerPath.includes('interior') ||
      lowerPath.includes('3d')) {
    return 'render';
  }
  
  // Sketch patterns
  if (lowerPath.includes('sketch') || 
      lowerPath.includes('concept') || 
      lowerPath.includes('draft') ||
      lowerPath.includes('drawing')) {
    return 'sketch';
  }
  
  // Process patterns
  if (lowerPath.includes('process') || 
      lowerPath.includes('wip') || 
      lowerPath.includes('progress') ||
      lowerPath.includes('wireframe') ||
      lowerPath.includes('clay')) {
    return 'process';
  }
  
  // Detail patterns
  if (lowerPath.includes('detail') || 
      lowerPath.includes('close') || 
      lowerPath.includes('zoom')) {
    return 'detail';
  }
  
  return 'other';
}

/**
 * Generates descriptive titles for images
 */
function generateImageTitle(projectTitle: string, type: OrganizedImage['type'], index: number): string {
  const typeLabels = {
    featured: 'Featured View',
    render: 'Render',
    sketch: 'Concept Sketch',
    process: 'Work in Progress',
    detail: 'Detail View',
    other: 'View'
  };
  
  return `${projectTitle} - ${typeLabels[type]} ${index > 1 ? index : ''}`.trim();
}

/**
 * Gets the best quality image URL with fallback
 */
export function getBestImageUrl(image: OrganizedImage, work?: WorkResource): string {
  if (image.isOptimized && work?.optimize_attachment_url) {
    return work.optimize_attachment_url;
  }
  return image.url || work?.attachment_url || '';
}

/**
 * Calculates image statistics for a work
 */
export function getImageStats(imageGroup: ImageGroup) {
  return {
    total: imageGroup.all.length,
    renders: imageGroup.renders.length,
    sketches: imageGroup.sketches.length,
    process: imageGroup.process.length,
    other: imageGroup.other.length,
    hasFeatured: !!imageGroup.featured
  };
}