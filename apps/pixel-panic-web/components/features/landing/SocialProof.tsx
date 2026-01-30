// apps/pixel-panic-web/components/features/landing/SocialProof.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import Image from "next/image";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Video testimonial data
export interface VideoTestimonial {
  name: string;
  location: string;
  videoSrc: string;
  posterSrc: string;
}

const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    name: "Priya R.",
    location: "Andheri East, Mumbai",
    videoSrc: "/videos/pixel-panic-video-1.mp4",
    posterSrc: "/images/pixel-panic-image-1.png",
  },
  {
    name: "Amit S.",
    location: "Bandra, Mumbai",
    videoSrc: "/videos/pixel-panic-video-2.mp4",
    posterSrc: "/images/pixel-panic-image-2.png",
  },
  {
    name: "Rahul K.",
    location: "Powai, Mumbai",
    videoSrc: "/videos/pixel-panic-video-3.mp4",
    posterSrc: "/images/pixel-panic-image-3.png",
  },
];

// Video Lightbox Component
interface VideoLightboxProps {
  testimonial: VideoTestimonial;
  onClose: () => void;
}

function VideoLightbox({ testimonial, onClose }: VideoLightboxProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <video preload="metadata"
          src={testimonial.videoSrc}
          poster={testimonial.posterSrc}
          className="w-full h-auto max-h-[85vh] rounded-lg"
          controls

          loop
        />
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors"
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

// Video Card Component
interface VideoCardProps {
  testimonial: VideoTestimonial;
  onClick: () => void;
  index: number;
}

function VideoCard({ testimonial, onClick, index }: VideoCardProps) {
  return (
    <div
      className={`vd-card vd-card-${index} group cursor-pointer`}
      // style={{
      //   zIndex: index + 1,
      //   transform: `rotateY(${index % 2 === 0 ? -5 : 5}deg)`,
      // }}
      onClick={onClick}
    >
      <div className="relative w-full h-full rounded-2xl bg-white shadow-2xl overflow-hidden bg-black/30 border border-white/20">
        <Image
          src={testimonial.posterSrc}
          alt={`Testimonial from ${testimonial.name}`}
          fill
          sizes="(max-width: 768px) 280px, 320px"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 rounded-full p-4 transition-transform duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-black"
            >
              <path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="font-bold text-lg text-white">{testimonial.name}</p>
          <p className="text-sm text-white/80">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}

// Main SocialProof Component
export default function SocialProof() {
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Text movement timeline (like reference code)
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".testimonials-section",
        start: "top bottom",
        end: "300% top", // Match the card timeline for consistent timing
        scrub: 1,
      },
    });

    // Animate text titles horizontally (like reference code)
    textTl
      .to(".testimonials-section .first-title", {
        xPercent: 70,
      })
      .to(
        ".testimonials-section .sec-title",
        {
          xPercent: 25,
        },
        "<"
      )
      .to(
        ".testimonials-section .third-title",
        {
          xPercent: -50,
        },
        "<"
      );

    // Card pinning and stacking timeline (like reference code)
    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".testimonials-section",
        start: "top top", // Start pinning when section top hits viewport top
        end: "300% top", // Increased: Much longer scroll range for slower animation
        scrub: 1, // Reduced: Smoother scrubbing
        pin: true,
        pinType: "transform",
        // pinSpacing: true, // Added: Ensure proper pin spacing
        // anticipatePin: 1,
        // markers: true,
      },
    });

    // Animate cards with stacked effect - direct to final positions
    pinTl.from(".vd-card", {
      yPercent: 100,
      opacity: 0,
      rotation: (index) => (index % 2 === 0 ? -8 : 8), // Final tilt positions
      xPercent: (index) => (index % 2 === 0 ? -15 : 15), // Final horizontal positions
      y: (index) => 50 + index * 30, // Stack cards with increasing Y offset
      stagger: 0.3,
      ease: "power2.out",
    });

    // Cleanup
    return () => {
      textTl.kill();
      pinTl.kill();
    };
  }, []);

  return (
    <>
      <section ref={sectionRef} className="testimonials-section">
        {/* Text titles */}
        <div className="absolute size-full flex flex-col items-center justify-center">
          <h1 className="text-gray-900 first-title text-4xl sm:text-6xl lg:text-8xl font-bold leading-tight text-center">
            WHAT'S
          </h1>
          <h1
            className="sec-title text-4xl sm:text-6xl lg:text-8xl font-bold leading-tight text-center"
            style={{
              background: "linear-gradient(135deg, #FF6B27 0%, #E16036 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            EVERYONE
          </h1>
          <h1 className="text-gray-900 third-title text-4xl sm:text-6xl lg:text-8xl font-bold leading-tight text-center">
            TALKING
          </h1>
        </div>

        {/* Cards container */}
        <div className="pin-box">
          {VIDEO_TESTIMONIALS.map((testimonial, index) => (
            <VideoCard
              key={index}
              testimonial={testimonial}
              onClick={() => setActiveVideo(testimonial)}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Video Lightbox */}
      {activeVideo && (
        <VideoLightbox
          testimonial={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
