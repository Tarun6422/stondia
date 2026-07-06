import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  Search,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Clock,
  Eye,
  ArrowUpRight,
  Film,
  Factory,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { PageHero, CTASection } from "@/components/page-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import factory from "@/assets/factory.jpg";
import villa from "@/assets/project-villa.jpg";
import sustainability from "@/assets/sustainability.jpg";
import texture from "@/assets/texture-stone.jpg";
import jali from "@/assets/product-jali.jpg";
import column from "@/assets/product-column.jpg";
import cobbles from "@/assets/product-cobbles.jpg";

import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/videos")({
  head: () => ({
    meta: buildMeta({
      title: "Media Center — Videos & Documentary | Stone India Heritage",
      description: "Explore our video library featuring quarry tours, manufacturing processes, craftsmanship stories, and the complete factory documentary about Rajasthan sandstone.",
      path: "/videos",
    }),
    links: [canonicalLink("/videos")],
    scripts: [
      jsonLdScript(breadcrumbSchema([
        { name: "Home", item: "/" },
        { name: "Media Center", item: "/videos" },
      ])),
    ],
  }),
  component: Videos,
});

/* ------------------------------------------------------------------ */
/*  VIDEO DATA                                                        */
/* ------------------------------------------------------------------ */

type VideoEntry = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  image: string;
  embed: string;
  date: string;
  views: string;
  tab: "videos" | "documentary";
};

const VIDEOS: VideoEntry[] = [
  // ── Videos tab ──
  { id: "v1", title: "Inside Our Quarries", description: "Explore our heritage sandstone quarries in Jodhpur — where centuries-old deposits meet modern extraction techniques.", category: "Factory", duration: "3:42", image: sustainability, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "June 15, 2026", views: "2.4K", tab: "videos" },
  { id: "v2", title: "Precision Manufacturing Tour", description: "A complete walkthrough of our CNC calibration, gang-saw cutting, and quality control processes.", category: "Factory", duration: "5:18", image: factory, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "June 10, 2026", views: "3.1K", tab: "videos" },
  { id: "v3", title: "The Art of Hand Carving", description: "Master artisans demonstrate the traditional hand-carving techniques passed down through generations.", category: "Products", duration: "4:05", image: texture, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "June 5, 2026", views: "4.8K", tab: "videos" },
  { id: "v4", title: "Project Spotlight: Desert Villa", description: "See how our sandstone cladding and carved columns transformed a private Dubai estate into a architectural landmark.", category: "Projects", duration: "2:56", image: villa, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "May 28, 2026", views: "1.9K", tab: "videos" },
  { id: "v5", title: "Heritage Temple Restoration", description: "Museum-grade restoration of a 200-year-old temple using hand-carved jali panels and carved columns.", category: "Architecture", duration: "6:12", image: jali, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "May 20, 2026", views: "5.2K", tab: "videos" },
  { id: "v6", title: "CNC Calibration & Quality Control", description: "How we achieve international export tolerances through precision CNC calibration and rigorous QA.", category: "Factory", duration: "4:33", image: column, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "May 14, 2026", views: "1.6K", tab: "videos" },
  { id: "v7", title: "Wall Cladding Installation Guide", description: "Step-by-step guide to installing our calibrated sandstone cladding panels on exterior facades.", category: "Installation", duration: "7:05", image: texture, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "May 8, 2026", views: "3.7K", tab: "videos" },
  { id: "v8", title: "Sustainability at Stone India", description: "Our commitment to responsible quarrying, water recycling, and waste reduction in every operation.", category: "Corporate", duration: "3:28", image: sustainability, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "April 30, 2026", views: "2.1K", tab: "videos" },
  { id: "v9", title: "Paving & Cobble Installation", description: "Professional installation techniques for sandstone cobbles and paving in landscape projects.", category: "Installation", duration: "5:45", image: cobbles, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "April 22, 2026", views: "2.8K", tab: "videos" },
  { id: "v10", title: "Exhibition: Stone+Architecture 2026", description: "Highlights from our showcase at the international stone and architecture exhibition in Dubai.", category: "Exhibitions", duration: "2:30", image: villa, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "April 15, 2026", views: "1.4K", tab: "videos" },
  { id: "v11", title: "Jali Patterns Through the Ages", description: "A visual journey through the geometric and floral lattice patterns that define Rajasthani architecture.", category: "Architecture", duration: "5:00", image: jali, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "April 8, 2026", views: "3.9K", tab: "videos" },
  { id: "v12", title: "Stone Selection for Architects", description: "How to choose the right sandstone finish, thickness, and calibration for architectural specifications.", category: "Products", duration: "6:40", image: column, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "April 1, 2026", views: "4.3K", tab: "videos" },
  { id: "v13", title: "Corporate Overview 2026", description: "An overview of Stone India Heritage — our quarries, factory, team, and global footprint across 35+ countries.", category: "Corporate", duration: "4:15", image: factory, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "March 25, 2026", views: "1.1K", tab: "videos" },
  { id: "v14", title: "Project: Coastal Resort Bali", description: "Behind the scenes of our largest hospitality project — sandstone cladding and paving for a 5-star resort.", category: "Projects", duration: "4:50", image: villa, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "March 18, 2026", views: "2.5K", tab: "videos" },
  { id: "v15", title: "Exhibition: India Stone Mart 2026", description: "Our presence at India's premier natural stone trade fair, showcasing new finishes and product lines.", category: "Exhibitions", duration: "2:45", image: texture, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "March 10, 2026", views: "980", tab: "videos" },

  // ── Documentary tab ──
  { id: "d1", title: "The Heritage of Rajasthani Stone", description: "A feature-length documentary tracing the journey of sandstone from ancient quarries to modern architecture.", category: "Factory", duration: "18:30", image: sustainability, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "June 20, 2026", views: "8.2K", tab: "documentary" },
  { id: "d2", title: "From Quarry to Site: The Full Journey", description: "Follow a single block of sandstone from extraction through cutting, finishing, quality control, and global shipping.", category: "Factory", duration: "22:15", image: factory, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "June 18, 2026", views: "6.7K", tab: "documentary" },
  { id: "d3", title: "Craftsmanship: The Carvers of Jodhpur", description: "An intimate portrait of the master artisans who have kept the tradition of hand-carving alive for generations.", category: "Products", duration: "15:40", image: jali, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "June 14, 2026", views: "9.1K", tab: "documentary" },
  { id: "d4", title: "Engineering Natural Stone", description: "How modern technology and traditional craftsmanship combine to produce precision architectural stone products.", category: "Factory", duration: "20:00", image: column, embed: "https://www.youtube.com/embed/aqz-KE-bpKQ", date: "June 10, 2026", views: "5.4K", tab: "documentary" },
  { id: "d5", title: "Global Impact: Indian Stone in World Architecture", description: "How Rajasthan sandstone has shaped iconic buildings across six continents — from Dubai to Melbourne.", category: "Architecture", duration: "25:00", image: villa, embed: "https://www.youtube.com/embed/ScMzIvxBSi4", date: "June 5, 2026", views: "7.8K", tab: "documentary" },
];

const CATEGORIES = ["All", "Factory", "Products", "Architecture", "Installation", "Projects", "Corporate", "Exhibitions"];

/* ================================================================== */
/*  PREMIUM VIDEO CARD                                                */
/* ================================================================== */

function VideoCard({
  video,
  index,
  onPlay,
}: {
  video: VideoEntry;
  index: number;
  onPlay: (id: string) => void;
}) {
  const shareVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: video.title, text: video.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href + "#" + video.id);
      toast.success("Video link copied");
    }
  };

  const downloadBrochure = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Preparing brochure", {
      description: `Brochure for "${video.title}" — your download will start shortly.`,
    });
  };

  return (
    <Reveal delay={(index % 4) * 0.06}>
      <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
        {/* Thumbnail */}
        <button
          onClick={() => onPlay(video.id)}
          aria-label={`Play ${video.title}`}
          className="relative block w-full overflow-hidden"
        >
          <div className="aspect-video overflow-hidden">
            <img
              src={video.image}
              alt={video.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-[var(--gold-foreground)] shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-gold"
              whileHover={{ scale: 1.1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <Play className="h-6 w-6 translate-x-0.5 fill-current" />
            </motion.span>
          </div>

          {/* Duration badge */}
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white tabular-nums">
            {video.duration}
          </span>

          {/* Category badge */}
          <span className="absolute left-3 top-3 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-0.5 text-[0.65rem] font-medium text-foreground">
            {video.category}
          </span>
        </button>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif text-base text-foreground line-clamp-1">{video.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {video.description}
          </p>

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-3 text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {video.date}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {video.views} views
            </span>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
            <button
              onClick={shareVideo}
              aria-label={`Share ${video.title}`}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button
              onClick={downloadBrochure}
              aria-label={`Download brochure for ${video.title}`}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" /> Brochure
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/*  PREMIUM FULLSCREEN VIDEO PLAYER                                   */
/* ================================================================== */

function VideoPlayerModal({
  videos,
  activeId,
  onClose,
  onNavigate,
}: {
  videos: VideoEntry[];
  activeId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const index = activeId ? videos.findIndex((v) => v.id === activeId) : -1;
  const current = index >= 0 ? videos[index] : null;
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();
  const progressRef = useRef<HTMLDivElement>(null);

  const related = useMemo(
    () => (current ? videos.filter((v) => v.id !== current.id).slice(0, 4) : []),
    [current, videos],
  );

  // Keyboard handling
  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(videos[index - 1].id);
      if (e.key === "ArrowRight" && index < videos.length - 1) onNavigate(videos[index + 1].id);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeId, index, videos, onClose, onNavigate]);

  // Auto-hide controls
  const showControlsTemp = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const shareVideo = () => {
    if (current) {
      if (navigator.share) {
        navigator.share({ title: current.title, text: current.description, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Video link copied");
      }
    }
  };

  const downloadVideo = () => {
    toast.success("Preparing download", {
      description: "Your video download will start shortly.",
    });
  };

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`Playing: ${current.title}`}
        onMouseMove={showControlsTemp}
        onMouseLeave={() => setShowControls(true)}
        onTouchStart={showControlsTemp}
      >
        {/* Top bar — close + title */}
        <motion.div
          className={`flex items-center justify-between px-5 py-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              aria-label="Close video player"
              className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-[0.15em] text-gold">{current.category}</p>
              <p className="text-sm text-white/90">{current.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 tabular-nums">
              {index + 1} / {videos.length}
            </span>
          </div>
        </motion.div>

        {/* Video area */}
        <div className="relative flex flex-1 items-center justify-center px-4">
          {/* Previous */}
          {index > 0 && (
            <button
              onClick={() => onNavigate(videos[index - 1].id)}
              aria-label="Previous video"
              className={`absolute left-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Video container */}
          <motion.div
            className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-video bg-black">
              <iframe
                key={current.id}
                src={`${current.embed}?autoplay=1&rel=0&controls=0${muted ? "&mute=1" : ""}`}
                title={current.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Center play button overlay (shown when controls visible) */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <button
                  onClick={() => {}}
                  aria-label="Play/Pause"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-[var(--gold-foreground)] shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                >
                  <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Next */}
          {index < videos.length - 1 && (
            <button
              onClick={() => onNavigate(videos[index + 1].id)}
              aria-label="Next video"
              className={`absolute right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Controls bar */}
        <motion.div
          className={`space-y-3 px-5 pb-5 pt-3 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="group/progress relative h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2"
          >
            <div className="h-full w-1/3 rounded-full bg-gold transition-all duration-200" />
            <div className="absolute left-1/3 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-gold group-hover/progress:block" />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Time */}
              <span className="text-xs text-white/60 tabular-nums">1:28 / {current.duration}</span>

              {/* Volume */}
              <button
                onClick={() => setMuted(!muted)}
                aria-label={muted ? "Unmute" : "Mute"}
                className="text-white/60 transition-colors hover:text-white"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={shareVideo}
                aria-label="Share video"
                className="rounded-md px-2.5 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={downloadVideo}
                aria-label="Download video"
                className="rounded-md px-2.5 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const el = document.querySelector("iframe");
                  if (el) el.requestFullscreen?.();
                }}
                aria-label="Fullscreen"
                className="rounded-md px-2.5 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Related videos drawer */}
        {related.length > 0 && (
          <motion.div
            className="border-t border-white/10 bg-black/60 backdrop-blur-md"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="flex items-center gap-6 overflow-x-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>
              <span className="shrink-0 text-xs uppercase tracking-[0.15em] text-white/50 font-medium">
                Related Videos
              </span>
              {related.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onNavigate(v.id)}
                  className="group/rel flex shrink-0 items-center gap-3 text-left transition-opacity hover:opacity-80"
                >
                  <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                    <img src={v.image} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover/rel:opacity-100">
                      <Play className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="w-36">
                    <p className="text-xs text-white/90 line-clamp-1">{v.title}</p>
                    <p className="text-[0.6rem] text-white/50">{v.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  PAGE COMPONENT                                                    */
/* ================================================================== */

function Videos() {
  const [activeTab, setActiveTab] = useState<"videos" | "documentary">("videos");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [playerVideoId, setPlayerVideoId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter videos based on tab, category, and search
  const filteredVideos = useMemo(() => {
    let list = VIDEOS.filter((v) => v.tab === activeTab);
    if (activeCategory !== "All") list = list.filter((v) => v.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, activeCategory, searchQuery]);

  // Get available categories for the active tab
  const availableCategories = useMemo(() => {
    const cats = new Set(VIDEOS.filter((v) => v.tab === activeTab).map((v) => v.category));
    return ["All", ...CATEGORIES.filter((c) => c === "All" || cats.has(c))];
  }, [activeTab]);

  const handlePlay = (id: string) => {
    setPlayerVideoId(id);
  };

  const handleNavigate = (id: string) => {
    setPlayerVideoId(id);
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keyboard shortcut for escape from search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const videoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    VIDEOS.filter((v) => v.tab === activeTab).forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [activeTab]);

  return (
    <>
      <PageHero
        eyebrow="Media Center"
        title="The story of stone, in motion"
        intro="Go behind the scenes across our quarries, factory floor, and finished landmarks. Watch the full factory documentary."
        image={factory}
      />

      <section className="py-16">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Media Center" }]} className="mb-8" />

          {/* ── Tab Navigation ── */}
          <div className="mb-10 flex items-center gap-1 rounded-xl border border-border/60 bg-card p-1.5 shadow-soft">
            <button
              onClick={() => { setActiveTab("videos"); setActiveCategory("All"); setSearchQuery(""); }}
              aria-pressed={activeTab === "videos"}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === "videos"
                  ? "bg-gold text-[var(--gold-foreground)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Film className="h-4 w-4" /> Videos
              <span className="ml-0.5 rounded-full bg-background/40 px-1.5 py-0.5 text-[0.6rem] tabular-nums">
                {VIDEOS.filter((v) => v.tab === "videos").length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("documentary"); setActiveCategory("All"); setSearchQuery(""); }}
              aria-pressed={activeTab === "documentary"}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === "documentary"
                  ? "bg-gold text-[var(--gold-foreground)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Factory className="h-4 w-4" /> Factory Documentary
              <span className="ml-0.5 rounded-full bg-background/40 px-1.5 py-0.5 text-[0.6rem] tabular-nums">
                {VIDEOS.filter((v) => v.tab === "documentary").length}
              </span>
            </button>
          </div>

          {/* ── Search + Filters ── */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search videos… (press "/")'
                aria-label="Search videos"
                className="w-full rounded-xl border border-border/60 bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>

            {/* Desktop category filters */}
            <div className="hidden flex-wrap gap-2 md:flex">
              {availableCategories.map((cat) => {
                const count = cat === "All" ? filteredVideos.length : videoCounts[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={activeCategory === cat}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                      activeCategory === cat
                        ? "border-gold bg-gold text-[var(--gold-foreground)]"
                        : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {cat}
                    <span className="ml-1.5 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile filter chips */}
          {showMobileFilters && (
            <motion.div
              className="mb-6 flex flex-wrap gap-2 md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {availableCategories.map((cat) => {
                const count = cat === "All" ? filteredVideos.length : videoCounts[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={activeCategory === cat}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? "border-gold bg-gold text-[var(--gold-foreground)]"
                        : "border-border/60 bg-card text-muted-foreground"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* ── Results count ── */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? (
                <>
                  Showing <span className="font-medium text-foreground">{filteredVideos.length}</span> result
                  {filteredVideos.length !== 1 ? "s" : ""} for &ldquo;<span className="font-medium text-foreground">{searchQuery}</span>&rdquo;
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">{filteredVideos.length}</span>{" "}
                  {activeTab === "videos" ? "videos" : "documentary films"}
                  {activeCategory !== "All" && <> in <span className="font-medium text-foreground">{activeCategory}</span></>}
                </>
              )}
            </p>
          </div>

          {/* ── Video Grid ── */}
          {filteredVideos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVideos.map((v, i) => (
                <VideoCard key={v.id} video={v} index={i} onPlay={handlePlay} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Film className="h-12 w-12 text-muted-foreground/40" />
              <div>
                <p className="font-serif text-xl text-foreground">No videos found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery
                    ? `No results matching "${searchQuery}". Try a different search term.`
                    : "No videos in this category yet."}
                </p>
              </div>
              {searchQuery && (
                <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* ── Bottom CTA for documentary tab ── */}
          {activeTab === "documentary" && filteredVideos.length > 0 && (
            <Reveal className="mt-12">
              <div className="rounded-2xl border border-gold/10 bg-gradient-to-br from-muted/50 to-card p-8 text-center md:p-12">
                <p className="eyebrow">Full Documentary Series</p>
                <h3 className="mt-3 font-serif text-2xl text-foreground md:text-3xl">
                  The Complete Stone India Heritage Story
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                  From ancient quarry beds to global architectural landmarks — experience the entire journey
                  of Rajasthan sandstone in our feature documentary collection.
                </p>
                <Button asChild variant="gold" size="lg" className="mt-6">
                  <Link to="/contact">
                    Request Full Documentary Access
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Video Player Modal ── */}
      <VideoPlayerModal
        videos={filteredVideos}
        activeId={playerVideoId}
        onClose={() => setPlayerVideoId(null)}
        onNavigate={handleNavigate}
      />

      <CTASection />

      {/* Inline styles for scrollbar hiding */}
      <style>{`
        [style*="scrollbarWidth: none"]::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
