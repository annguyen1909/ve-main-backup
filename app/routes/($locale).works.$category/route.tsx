import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  useLoaderData,
  useOutletContext,
  useSearchParams,
} from "@remix-run/react";
import { Container } from "~/components/ui/container";
import * as motion from "motion/react-client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CrossIcon,
} from "~/components/ui/icon";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Api } from "~/lib/api";
import { CategoryResource } from "~/types/categories";
import { title } from "~/lib/utils";
import type { AppContext, loader as rootLoader } from "~/root";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import { 
  groupWorksByProject,
  type OrganizedProject
} from "~/lib/api-data-processor";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const slug = params.category ?? "";

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const tagId = url.searchParams.get("tag_id") ?? "";

  const locale = params.locale ?? "en";

  const api = new Api();

  const categories = await api
    .getCategories(locale)
    .then((response) => response.data.data);
  const category = categories.find(
    (category: CategoryResource) => category.slug === slug
  );

  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  const works = await api
    .getWorks(locale, category.slug, query, tagId)
    .then((response) => response.data.data);
  const tags = await api.getTags(locale).then((response) => response.data.data);

  // Group and normalize works into projects on the server so the client receives ready-to-render data
  const projects = groupWorksByProject(works);

  return {
    locale,
    category,
    projects,
    tags,
  };
}

export const meta: MetaFunction<typeof loader, { root: typeof rootLoader }> = ({
  data,
}) => {
  return [
    {
      title: title(
        data?.locale === "ko"
          ? data.category.slug === "image"
            ? "조감도 | 투시도 | 건축CG | 분양CG"
            : "건축CG영상"
          : data?.category.title
      ),
    },
    { name: "description", content: data?.category.description },
  ];
};

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { translations: t } = useOutletContext<AppContext>();
  const { projects, tags } = useLoaderData<typeof loader>();
  const [showSearch, setShowSearch] = useState(searchParams.get("q") ?? false);
  const [selectedProject, setSelectedProject] =
    useState<OrganizedProject | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null);

  // Projects are provided by the loader (server-side grouping & normalization)
  // The loader already respects `q` and `tag_id` search params so changing them will reload data

  function handleImageClick(project: OrganizedProject, imageIndex: number = 0) {
    setSelectedProject(project);
    setSelectedImageIndex(imageIndex);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedProject(null);
    setSelectedImageIndex(0);
  }

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedProject) return;

      const totalImages = selectedProject.images.length;

      // Prefer embla for smooth animation when available
      if (emblaApi) {
        if (direction === "prev") emblaApi.scrollPrev();
        else emblaApi.scrollNext();
        return;
      }

      if (direction === "prev") {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
      } else {
        setSelectedImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
      }
    },
    [selectedProject, emblaApi]
  );

  useEffect(() => {
    if (!showSearch) {
      setSearchParams(new URLSearchParams());
    }
  }, [showSearch, setSearchParams]);

  // Handle left/right arrow keys to navigate while modal is open
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!showModal) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateImage("prev");
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateImage("next");
      }
    }

    if (showModal) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [showModal, navigateImage]);

  // Disable right-click (context menu) on this page while mounted.
  useEffect(() => {
    function onContextMenu(e: Event) {
      e.preventDefault();
    }
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);

  return (
    <section className="min-h-dvh h-auto text-white pt-20">
      {/* Search and Filter Header */}
      <Container
        variant="fluid"
        className="sm:!px-10 mt-4 !py-0 flex flex-col md:flex-row md:items-center gap-5 md:gap-7"
      >
        <div className="flex items-center gap-5 flex-none">
          <button
            className="font-semibold text-lg 2xl:text-xl flex items-center cursor-pointer"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? (
              <MinusIcon className="size-5 mr-2" />
            ) : (
              <PlusIcon className="size-5 mr-2" />
            )}
            {t["Search & Filter"]}
          </button>
          <span className="font-light text-sm 2xl:text-base">
            {projects.length} {t["projects"]}
          </span>
        </div>

        <AnimatePresence>
          {showSearch ? (
            <motion.div
              className="flex-none items-center gap-7 flex max-w-full grow"
              initial={{ translateX: "-10%", opacity: 0 }}
              animate={{ translateX: "0%", opacity: 100 }}
              exit={{ translateX: "-10%", opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 min-w-32 flex-none">
                <input
                  type="search"
                  className="outline-none bg-transparent border-b border-b-white py-0.5 rounded-none"
                  placeholder={t["Search works..."]}
                  defaultValue={searchParams.get("q") ?? ""}
                  data-koreanable
                  onChange={(event) => {
                    const params = searchParams;
                    params.set("q", event.target.value.trim());
                    setSearchParams(params);
                  }}
                />
                <MagnifyingGlassIcon className="-scale-x-100 text-white size-5" />
              </div>

              <div className="flex items-center gap-5 font-extralight overflow-auto max-w-full">
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => {
                      const params = searchParams;
                      params.set("tag_id", tag.id);
                      setSearchParams(params);
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>

      {/* Projects Grid - One image per project */}
      <Container variant="fluid" className="sm:!px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
          {projects.map((project, projectIndex) => {
            const coverImage = project.images[0]; // Use first image as project cover
            const isVideoCover = coverImage.mediaType === 'video' && !!coverImage.videoUrl;

            return (
              <button
                key={project.title}
                type="button"
                onClick={() => handleImageClick(project, 0)}
                className="group cursor-pointer"
                onMouseEnter={() => {
                  // Play the nested video element if present
                  const vid = document.querySelector(`video[data-project-index="${projectIndex}"]`) as HTMLVideoElement | null;
                  if (vid) {
                    vid.play().catch(() => {});
                  }
                }}
                onMouseLeave={() => {
                  // Pause the nested video element if present
                  const vid = document.querySelector(`video[data-project-index="${projectIndex}"]`) as HTMLVideoElement | null;
                  if (vid) {
                    vid.pause();
                  }
                }}
              >
                {/* Project Cover Image */}
                <div
                  className={`aspect-[4/3] relative overflow-hidden transition-all duration-300 ${isVideoCover ? 'group-hover:shadow-2xl' : 'group-hover:shadow-2xl group-hover:bg-white/60'}`}
                >
                  {coverImage.mediaType === 'video' && coverImage.videoUrl ? (
                    // If the videoUrl is a YouTube or Vimeo link, embed via iframe; otherwise use a native <video>
                    (/youtube\.com|youtu\.be|vimeo\.com/i).test(coverImage.videoUrl) ? (
                      <iframe
                        className="w-full h-full object-cover"
                        src={
                          coverImage.videoUrl.includes('youtu')
                            ? coverImage.videoUrl.replace(/watch\?v=/, 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                            : coverImage.videoUrl.includes('vimeo')
                            ? coverImage.videoUrl.replace(/vimeo\.com\//, 'player.vimeo.com/video/')
                            : coverImage.videoUrl
                        }
                        title={project.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        className="w-full h-full object-cover"
                        src={coverImage.videoUrl}
                        muted
                        playsInline
                        loop
                        preload="metadata"
                        data-project-index={projectIndex}
                        onLoadedMetadata={(e) => {
                          // Seek a tiny amount to force the browser to render the first frame while paused
                          try {
                            const v = e.currentTarget as HTMLVideoElement;
                            if (v.readyState >= 1) {
                              v.currentTime = 0.05;
                              v.pause();
                            }
                          } catch (err) {
                            // ignore
                          }
                        }}
                      />
                    )
                  ) : (
                    <img
                      src={coverImage.url}
                      alt={project.title}
                      className="w-full h-full group-hover:scale-105 group-hover:blur-[1.5px] object-cover transition-transform duration-300"
                      loading="lazy"
                    />
                  )}

                  {/* Overlay with project info - only visible on hover (hidden for video covers) */}
                  {isVideoCover ? (
                    // For video covers we hide the dark background but still show the title on hover
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none">
                      <div className="absolute bottom-[40%] left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3
                          className="font-medium text-lg mb-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                          data-koreanable
                        >
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                      <div className="absolute bottom-[40%] left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3
                          className="font-medium text-lg mb-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                          data-koreanable
                        >
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Container>

      {/* Simplified Project Modal - Main image with thumbnails below */}
      <AnimatePresence>
        {showModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="relative w-full h-full max-w-7xl max-h-full flex flex-col">
              {/* (Close button moved inside main image display for better placement) */}

              {/* Project Title */}
              <div className="text-center mb-4 px-4">
                <h2
                  className="text-2xl lg:text-3xl font-medium text-white mb-2"
                  data-koreanable
                >
                  {selectedProject.title}
                </h2>
                <p className="text-gray-300 text-sm lg:text-base font-light">
                  {selectedProject.description}
                </p>
              </div>

              {/* Main Image Display (shadcn Carousel) */}
              <div className="flex-1 flex items-center justify-center min-h-0 mb-6 relative">
                <Carousel
                  setApi={(api: CarouselApi | undefined) => {
                    if (!api) return;
                    setEmblaApi(api);
                    if (typeof api.on === "function") {
                      api.on("select", () => {
                        const idx = api.selectedScrollSnap?.();
                        setSelectedImageIndex(typeof idx === "number" ? idx : 0);
                      });
                    }
                    if (typeof api.scrollTo === "function") {
                      // do not pass `true` (jump) here — let embla animate the initial scroll
                      api.scrollTo(selectedImageIndex || 0);
                    }
                  }}
                >
                  <CarouselContent className="h-full">
                    {selectedProject.images.map((img) => (
                      <CarouselItem key={img.id} className="relative w-full h-full flex items-center justify-center">
                        {/*
                          Wrap the actual media inside a positioned inline-block container so
                          the close button can be absolutely positioned relative to the visible
                          image (not the full slide area which includes carousel gutters).
                        */}
                        <div className="relative inline-block max-w-full">
                          {img.mediaType === 'video' && img.videoUrl ? (
                            (/youtube\.com|youtu\.be|vimeo\.com/i).test(img.videoUrl) ? (
                              <iframe
                                src={
                                  img.videoUrl.includes('youtu')
                                    ? img.videoUrl.replace(/watch\?v=/, 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                                    : img.videoUrl.includes('vimeo')
                                    ? img.videoUrl.replace(/vimeo\.com\//, 'player.vimeo.com/video/')
                                    : img.videoUrl
                                }
                                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                title={selectedProject.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={img.videoUrl || undefined}
                                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                controls
                                autoPlay
                                playsInline
                                controlsList="nodownload"
                                muted
                              />
                            )
                          ) : (
                            <img
                              src={img.url}
                              alt={img.title}
                              className="max-w-full max-h-[60vh] object-contain rounded-lg"
                            />
                          )}

                          <button
                            onClick={closeModal}
                            aria-label="Close"
                            className="absolute right-3 top-3 z-50 text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full p-3 cursor-pointer ring-2 ring-white/20"
                          >
                            <CrossIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>

                {/* Navigation Arrows */}
                {selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
              
              {/* Thumbnail Strip Below Main Image */}
              <div className="flex-none px-2 sm:px-4 pb-4">
                <div className="flex gap-1 sm:gap-2 justify-start sm:justify-center scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-2">
                  {selectedProject.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => {
                        if (emblaApi && typeof emblaApi.scrollTo === 'function') {
                          // pass only the index so embla performs a smooth animated scroll
                          emblaApi.scrollTo(index);
                        } else {
                          setSelectedImageIndex(index);
                        }
                      }}
                      className={`flex-none w-16 h-12 sm:w-20 sm:h-16 rounded-md overflow-hidden transition-all duration-200 hover:scale-105 ${
                        index === selectedImageIndex
                          ? 'ring-2 ring-white ring-offset-1 sm:ring-offset-2 ring-offset-black'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to attachment_url if optimize_attachment_url fails
                          const img = e.target as HTMLImageElement;
                          if (img.src.includes('optimize_attachment_url')) {
                            const fallbackSrc = image.url.replace(/optimize_attachment_url/g, 'attachment_url');
                            img.src = fallbackSrc;
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Simple Project Info: show correct singular/plural for images/videos */}
                <div className="mt-2 sm:mt-4 text-center text-gray-300">
                  <span className="text-xs sm:text-sm">
                    {(() => {
                      const imgs = selectedProject.images;
                      const imageCount = imgs.filter((it) => it.mediaType === 'image').length;
                      const videoCount = imgs.filter((it) => it.mediaType === 'video').length;

                      if (videoCount > 0 && imageCount === 0) {
                        return `${videoCount} ${videoCount === 1 ? 'video' : 'videos'}`;
                      }

                      if (imageCount > 0 && videoCount === 0) {
                        return `${imageCount} ${imageCount === 1 ? 'image' : 'images'}`;
                      }

                      // Mixed media
                      return `${videoCount} ${videoCount === 1 ? 'video' : 'videos'} · ${imageCount} ${imageCount === 1 ? 'image' : 'images'}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
