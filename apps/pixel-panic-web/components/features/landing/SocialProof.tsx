// apps/pixel-panic-web/components/features/landing/SocialProof.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- TYPE DEFINITION & DATA SOURCE (No Change) ---
export interface VideoTestimonial {
  name: string;
  location: string;
  videoSrc: string;
  posterSrc: string;
  rotation: string;
}

const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    name: "Priya R.",
    location: "Andheri East, Mumbai",
    videoSrc: "/videos/pixel-panic-video-1.mp4",
    posterSrc: "/images/pixel-panic-image-1.png",
    rotation: "rotate-[-2deg]",
  },
  {
    name: "Amit S.",
    location: "Bandra, Mumbai",
    videoSrc: "/videos/pixel-panic-video-2.mp4",
    posterSrc: "/images/pixel-panic-image-2.png",
    rotation: "rotate-[3deg]",
  },
  {
    name: "Rahul K.",
    location: "Powai, Mumbai",
    videoSrc: "/videos/pixel-panic-video-3.mp4",
    posterSrc: "/images/pixel-panic-image-3.png",
    rotation: "rotate-[2deg]",
  },
  {
    name: "Sneha M.",
    location: "Lower Parel, Mumbai",
    videoSrc: "/videos/pixel-panic-video-4.mp4",
    posterSrc: "/images/pixel-panic-image-4.png",
    rotation: "rotate-[-1deg]",
  },
];

// --- 1. NEW COMPONENT: VideoLightbox ---
interface VideoLightboxProps {
  testimonial: VideoTestimonial;
  onClose: () => void;
}

function VideoLightbox({ testimonial, onClose }: VideoLightboxProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg lg:max-w-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={testimonial.videoSrc}
          poster={testimonial.posterSrc}
          className="w-full h-auto max-h-[85vh] rounded-lg"
          controls
          autoPlay
          loop
        />
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 mr-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors"
          aria-label="Close video player"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// --- 2. UPDATED COMPONENT: VideoCard ---
interface VideoCardProps {
  testimonial: VideoTestimonial;
  onClick: () => void;
  index: number;
}

function VideoCard({ testimonial, onClick, index }: VideoCardProps) {
  return (
    <div
      className={`creator-card absolute cursor-pointer group`}
      style={{
        // Desktop: side by side positioning
        left: `${10 + index * 15}%`,
        top: `${15 + (index % 2) * 5}%`,
        // Mobile: center stacking (will be overridden by GSAP)
        transform: "translateX(-50%)",
        zIndex: index + 1,
      }}
      onClick={onClick}
    >
      <div className="relative w-[280px] h-[400px] rounded-xl bg-white shadow-2xl overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
        {/* Video/Image Container */}
        <div className="relative h-full w-full">
          <img
            src={testimonial.posterSrc}
            alt={`Testimonial from ${testimonial.name}`}
            className="h-full w-full object-cover"
          />

          {/* Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-black"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="font-nohemi text-lg font-bold text-white">
            {testimonial.name}
          </p>
          <p className="font-inter text-sm text-white/80">
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 3. MAIN COMPONENT: SocialProof ---
function SocialProof() {
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (testimonial: VideoTestimonial) => {
    setActiveVideo(testimonial);
  };

  const handleCloseLightbox = () => {
    setActiveVideo(null);
  };

  // --- DIGISIDEKICK-STYLE GSAP ANIMATION ---
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLDivElement>(
        cardsContainerRef.current?.children ?? []
      );
      if (cards.length === 0) return;

      // Check if mobile
      const isMobile = window.innerWidth < 768;

      // Set initial state - all cards off-screen with random rotations
      gsap.set(cards, {
        yPercent: 100,
        opacity: 0,
        rotation: () => -15 + Math.random() * 30, // Random rotation for dynamic feel
        willChange: "transform, opacity",
      });

      // Set initial positions based on screen size
      cards.forEach((card, index) => {
        if (isMobile) {
          // Mobile: center stacking
          gsap.set(card, {
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
          });
        } else {
          // Desktop: side by side positioning
          gsap.set(card, {
            left: `${10 + index * 15}%`,
            top: `${15 + (index % 2) * 5}%`,
            xPercent: 0,
            yPercent: 0,
          });
        }
      });

      // Create the timeline with pinning
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true, // Lock section to viewport
          start: "top top", // Start when section top hits viewport top
          end: "+=1200", // Much shorter scroll distance for faster animation
          scrub: 0.5, // Faster scrubbing for more responsive feel
          anticipatePin: 1, // Prevent jank
        },
      });

      // Animate each card in sequence (digisidekick style) - MUCH FASTER
      cards.forEach((card, index) => {
        if (isMobile) {
          // Mobile: animate to center with slight offset for stacking
          tl.to(
            card,
            {
              yPercent: -50 + index * 10, // Stack with slight offset
              opacity: 1,
              rotation: 0,
              duration: 0.3, // Much faster animation
              ease: "power2.out", // Faster easing
            },
            index * 0.15 // Much shorter stagger
          );
        } else {
          // Desktop: animate to final side-by-side positions
          tl.to(
            card,
            {
              yPercent: 0,
              opacity: 1,
              rotation: 0,
              duration: 0.3, // Much faster animation
              ease: "power2.out", // Faster easing
            },
            index * 0.15 // Much shorter stagger
          );
        }
      });

      // Add a shorter pause at the end before unlocking
      tl.to({}, { duration: 0.3 }); // Shorter pause for impact

      // Clean up will-change after animation
      tl.eventCallback("onComplete", () => {
        gsap.set(cards, { willChange: "auto" });
      });
    },
    { scope: sectionRef }
  );

  return (
    <>
      {/* Main Section - Full Viewport Pinned */}
      <section
        ref={sectionRef}
        className="relative h-screen overflow-hidden bg-gradient-to-br from-pink-50/30 to-purple-50/20"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10" />

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          {/* Big Heading - Digisidekick Style */}
          <div className="text-center mb-2">
            <h2 className="font-nohemi text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-deep-navy leading-tight">
              SEE WHAT OUR
            </h2>
            <h2 className="font-nohemi text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-deep-navy leading-tight">
              CUSTOMERS SAY
            </h2>
            <p className="mt-4 sm:mt-6 font-inter text-base sm:text-lg md:text-xl text-deep-navy/70 max-w-2xl mx-auto px-4">
              Don't just take our word for it. See the difference we make—one
              device at a time.
            </p>
          </div>

          {/* Cards Container - Centered */}
          <div
            ref={cardsContainerRef}
            className="relative w-full max-w-6xl h-[500px] flex items-center justify-center"
          >
            {VIDEO_TESTIMONIALS.map((testimonial, index) => (
              <VideoCard
                key={testimonial.name}
                testimonial={testimonial}
                onClick={() => handleCardClick(testimonial)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {activeVideo && (
        <VideoLightbox
          testimonial={activeVideo}
          onClose={handleCloseLightbox}
        />
      )}
    </>
  );
}

export default SocialProof;
