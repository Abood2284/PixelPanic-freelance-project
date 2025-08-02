"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VideoTestimonial } from "./SocialProof";

// Ensure GSAP plugin is registered
gsap.registerPlugin(ScrollTrigger);

interface VideoCardProps {
  testimonial: VideoTestimonial;
}

function VideoCard({ testimonial }: VideoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    if (!video || !card) return;

    // This ScrollTrigger handles video playback
    const playTrigger = ScrollTrigger.create({
      trigger: card,
      start: "center center",
      end: "bottom top",
      onEnter: () => video.play(),
      onLeave: () => video.pause(),
      onEnterBack: () => video.play(),
      onLeaveBack: () => video.pause(),
    });

    // This GSAP animation handles the card's initial fade-in
    const fadeInAnimation = gsap.fromTo(
      card,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
          // Mobile optimizations
          fastScrollEnd: window.innerWidth < 768 ? 300 : 500,
          preventOverlaps: true,
        },
      }
    );

    // Cleanup function to kill triggers and animations on unmount
    return () => {
      playTrigger.kill();
      fadeInAnimation.kill();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`w-full max-w-[280px] opacity-0 ${testimonial.rotation}`}
    >
      <div className="rounded-lg bg-white p-3 shadow-2xl">
        {/* Aspect ratio container ensures video keeps its shape */}
        {/* Note: Requires @tailwindcss/aspect-ratio plugin */}
        <div className="aspect-w-9 aspect-h-16 overflow-hidden rounded-md bg-slate-200">
          <video
            ref={videoRef}
            src={testimonial.videoSrc}
            poster={testimonial.posterSrc}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
          />
        </div>
        <div className="pt-4 text-center">
          <p className="font-urbanist text-lg font-bold text-deep-navy">
            {testimonial.name}
          </p>
          <p className="font-inter text-sm text-deep-navy/70">
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
