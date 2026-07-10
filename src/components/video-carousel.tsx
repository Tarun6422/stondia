/* ------------------------------------------------------------------ */
/*  FeaturedVideoCarousel — homepage video showcase section            */
/*  Shows curated videos from the media library with inline playback   */
/* ------------------------------------------------------------------ */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Eye, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/page-parts";
import { cn } from "@/lib/utils";

/* ── Video entry type ── */
type VideoEntry = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  image: string;
  videoUrl?: string;
  views: string;
};

/* ── Single video card ── */
function VideoCard({
  video,
  index,
  isActive,
  onActivate,
  onClose,
}: {
  video: VideoEntry;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleActivate = () => {
    if (!isActive) {
      onActivate();
      // Clear any pending timeout from a previous card
      clearTimeout(timerRef.current);
      // Small delay to let the animation settle before starting video
      timerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 300);
    } else {
      handlePlay();
    }
  };

  return (
    <Reveal delay={(index % 3) * 0.08}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border bg-card transition-all duration-500",
          isActive
            ? "border-gold/50 shadow-elegant ring-1 ring-gold/20 scale-[1.02] z-10"
            : "border-border hover:border-gold/30 hover:shadow-md",
        )}
      >
        {/* Thumbnail / Video area */}
        <div className="relative aspect-video overflow-hidden bg-black">
          {/* Poster image (shown when not active) */}
          <AnimatePresence>
            {!isActive && (
              <motion.img
                src={video.image}
                alt={video.title}
                className="absolute inset-0 h-full w-full object-cover"
                initial={false}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Video element */}
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.image}
            className={cn(
              "h-full w-full transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            muted
            playsInline
            loop
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Gradient overlay when showing poster */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity",
              isActive ? "opacity-0" : "opacity-100",
            )}
          />

          {/* Play button */}
          <button
            onClick={handleActivate}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
            )}
          >
            <motion.span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
                isActive
                  ? "bg-background/80 text-foreground backdrop-blur-sm"
                  : "bg-gold text-[var(--gold-foreground)] group-hover:scale-110 group-hover:shadow-gold",
              )}
              whileHover={{ scale: 1.1 }}
              animate={!isActive ? { scale: [1, 1.05, 1] } : undefined}
              transition={
                !isActive ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : undefined
              }
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 translate-x-0.5 fill-current" />
              )}
            </motion.span>
          </button>

          {/* Close button (when active) */}
          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                setIsPlaying(false);
                if (videoRef.current) videoRef.current.pause();
              }}
              aria-label="Close video"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 opacity-0 transition-opacity hover:bg-black/80 hover:text-white group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Category badge */}
          <span className="absolute left-3 top-3 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-0.5 text-[0.6rem] font-medium text-foreground">
            {video.category}
          </span>

          {/* Duration badge */}
          <span
            className={cn(
              "absolute bottom-3 right-3 rounded-md bg-black/70 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white tabular-nums transition-opacity",
              isActive ? "opacity-0" : "opacity-100",
            )}
          >
            {video.duration}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif text-base text-foreground line-clamp-1">{video.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {video.description}
          </p>
          <div className="mt-3 flex items-center gap-3 text-[0.55rem] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {video.views} views
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Props ── */
type FeaturedVideoCarouselProps = {
  videos: VideoEntry[];
  title?: string;
  eyebrow?: string;
  intro?: string;
};

/* ── Main component ── */
export function FeaturedVideoCarousel({
  videos,
  title = "Featured Videos",
  eyebrow = "Media Center",
  intro = "Go behind the scenes across our quarries, factory floor, and finished landmarks.",
}: FeaturedVideoCarouselProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="bg-secondary/50 py-24">
      <div className="container-lux">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
          <Reveal delay={0.1}>
            <Button asChild variant="outline">
              <Link to="/videos">
                View all videos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, 6).map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              index={i}
              isActive={activeId === video.id}
              onActivate={() => setActiveId(video.id)}
              onClose={() => setActiveId(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
