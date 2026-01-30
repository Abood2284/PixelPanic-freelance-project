"use client";

import React, { useLayoutEffect, useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(true);

type Vid = { src: string; poster?: string };
type Props = { videos?: Vid[] };

const DEFAULT_VIDEOS: Vid[] = [
  {
    poster:
      "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/fcdcca5d3be3f290c841d2255aa9795b/thumbnails/thumbnail.jpg?height=720",
    src: "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/fcdcca5d3be3f290c841d2255aa9795b/downloads/default.mp4",
  },
  {
    poster:
      "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/fcdcca5d3be3f290c841d2255aa9795b/thumbnails/thumbnail.jpg?height=720",
    src: "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/fcdcca5d3be3f290c841d2255aa9795b/downloads/default.mp4",
  },
  {
    poster:
      "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/051d60cfdb9fb3159db45644004217c5/thumbnails/thumbnail.jpg?height=720",
    src: "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/051d60cfdb9fb3159db45644004217c5/downloads/default.mp4",
  },
  {
    poster:
      "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/051d60cfdb9fb3159db45644004217c5/thumbnails/thumbnail.jpg?height=720",
    src: "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/051d60cfdb9fb3159db45644004217c5/downloads/default.mp4",
  },
  {
    poster:
      "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/d1cf2c712fbbab4e14963d213e8c91e7/thumbnails/thumbnail.jpg?height=720",
    src: "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/d1cf2c712fbbab4e14963d213e8c91e7/downloads/default.mp4",
  },
  {
    poster:
      "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/d1cf2c712fbbab4e14963d213e8c91e7/thumbnails/thumbnail.jpg?height=720",
    src: "https://customer-f8j7l772wbsnmaey.cloudflarestream.com/d1cf2c712fbbab4e14963d213e8c91e7/downloads/default.mp4",
  },
];

export default function UGCScroller({ videos = DEFAULT_VIDEOS }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // ===== Hover playback with click-to-unlock-audio =====
  const [isDesktopHoverable, setIsDesktopHoverable] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const cardVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 769px) and (hover: hover) and (pointer: fine)"
    );
    const apply = () => setIsDesktopHoverable(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // First user click anywhere unlocks audio for subsequent hovers
  useEffect(() => {
    const unlock = () => setAudioUnlocked(true);
    window.addEventListener("click", unlock, { once: true, passive: true });
    return () => window.removeEventListener("click", unlock);
  }, []);

  const pauseAllThumbs = () => {
    cardVideoRefs.current.forEach((v) => {
      if (!v) return;
      v.pause();
      v.currentTime = 0;
    });
  };

  const hoverPlay = (i: number) => {
    if (!isDesktopHoverable) return;
    const v = cardVideoRefs.current[i];
    if (!v) return;
    pauseAllThumbs();

    // Before first click, keep muted for autoplay policy; after click, unmute
    v.muted = !audioUnlocked;
    if (audioUnlocked) v.removeAttribute("muted");
    else v.setAttribute("muted", "");

    if (v.readyState < 2) v.load();
    v.play().catch(() => {
      // If any policy still blocks, it'll be because of site conditions; ignore.
    });
  };

  const hoverStop = (i: number) => {
    const v = cardVideoRefs.current[i];
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };
  // ===========================================

  // Modal player (unchanged behavior; always unmuted)
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSrc, setPopupSrc] = useState<string>("");
  const popupVideoRef = useRef<HTMLVideoElement | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!popupOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [popupOpen]);

  const openPlayer = (src: string) => {
    pauseAllThumbs();
    setPopupSrc(src);
    setPopupOpen(true);
  };

  useEffect(() => {
    if (!popupOpen || !popupSrc) return;
    const v = popupVideoRef.current;
    if (!v) return;
    v.pause();
    v.muted = false;
    v.removeAttribute("muted");
    v.src = popupSrc;
    v.load();
    const playNow = () =>
      v.play().catch(() => {
        /* user can tap play */
      });
    if (v.readyState >= 2) playNow();
    else {
      const onCanPlay = () => {
        v.removeEventListener("canplay", onCanPlay);
        playNow();
      };
      v.addEventListener("canplay", onCanPlay);
      return () => v.removeEventListener("canplay", onCanPlay);
    }
  }, [popupOpen, popupSrc]);

  const closePlayer = () => {
    const v = popupVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
      v.removeAttribute("src");
      v.load();
    }
    setPopupOpen(false);
    setPopupSrc("");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlayer();
    };
    if (popupOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [popupOpen]);

  // ===== GSAP pin & text motion =====
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const cards = gsap.utils.toArray<HTMLDivElement>(".ugc-item");

      const baseEnd = () =>
        window.innerHeight * (window.innerWidth < 769 ? 4.0 : 3);

      gsap.set(cards, {
        yPercent: 150,
        xPercent: (i: number) => 170 - i * 40,
        opacity: 0,
      });

      mm.add(
        { isMobile: "(max-width: 768px)", isDesktop: "(min-width: 769px)" },
        (mediaCtx) => {
          const { isMobile } = mediaCtx.conditions as {
            isMobile: boolean;
            isDesktop: boolean;
          };

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => `+=${Math.round(baseEnd() * (isMobile ? 1.6 : 1))}`,
              pin: true, // keep pinned for your cards animation
              scrub: isMobile ? 1.8 : 1,
              anticipatePin: 1,
            },
          });

          // Move ALL THREE lines; 1 & 3 right equally, 2 left
          const dxDesk = 200;
          const dxMob = 60;

          tl.to(
            ".bg-content h2:nth-of-type(1)",
            { x: isMobile ? dxMob : dxDesk },
            0
          )
            .to(
              ".bg-content h2:nth-of-type(2)",
              { x: isMobile ? -dxMob : -dxDesk },
              0
            )
            .to(
              ".bg-content h2:nth-of-type(3)",
              { x: isMobile ? dxMob : dxDesk },
              0
            )
            // Cards fan-in as before
            .to(
              cards,
              {
                yPercent: -50,
                xPercent: isMobile ? -50 : 0,
                opacity: 1,
                stagger: { each: 0.15, from: "start" },
                duration: isMobile ? 0.6 : 0.8,
              },
              0.1
            )
            .to(
              cards,
              {
                yPercent: "-=4",
                duration: 0.3,
                stagger: { each: 0.05, from: "start" },
              },
              ">-0.2"
            )
            .to(
              cards,
              {
                yPercent: "+=4",
                duration: 0.3,
                stagger: { each: 0.05, from: "start" },
              },
              ">-0.15"
            );
        }
      );
    });
    return () => ctx.revert();
  }, []);
  // ===================================

  return (
    <>
      <section ref={sectionRef} className="ugc-section ugc-scope">
        {/*<a href="/pages/ugc-portfolio" className="view-ugc-btn">See More</a>*/}

        <div className="ugc-wrapper">
          <div className="bg-content" aria-hidden>
            <h2>SEE OUR</h2>
            <h2>TOP USER</h2>
            <h2>REVIEWS</h2>
          </div>

          <div className="ugc-list-wrap">
            {videos.map((v, i) => (
              <div
                className={`ugc-item video-card-${i + 1}`}
                key={i}
                onClick={() => openPlayer(v.src)}
                role="button"
                aria-label="Play video"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openPlayer(v.src);
                }}
                onMouseEnter={() => hoverPlay(i)}
                onMouseLeave={() => hoverStop(i)}
              >
                <video
                  ref={(el) => {
                    cardVideoRefs.current[i] = el;
                  }}
                  className="video-thumbnail"
                  playsInline
                  preload="metadata"
                  poster={v.poster}
                  muted // ensures first-hover autoplay works
                >
                  <source src={v.src} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .ugc-section {
            position: relative;
            width: 100%;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #efe7d9;
            overflow: clip;
          }
          .ugc-wrapper {
            position: relative;
            width: min(1680px, 100vw);
            height: 100vh;
            padding: 0;
          }
          .bg-content {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            pointer-events: none;
            z-index: 0;
          }
          .bg-content h2 {
            font-size: 12vw; /* desktop scale */
            margin: 0;
            line-height: 1;
            font-weight: 700;
            text-align: center;
            color: #101828;
            user-select: none;
          }
          .bg-content h2:nth-of-type(2) {
            color: #ec642f;
          }

          .ugc-list-wrap {
            position: absolute;
            inset: 0;
            z-index: 1;
          }

          .ugc-item {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            border: 5px solid #fff;
            border-radius: 14px;
            height: min(500px, 60vh);
            width: min(310px, 34vw);
            will-change: transform, opacity;
            background: #000;
            overflow: hidden;
            cursor: pointer;
          }
          video.video-thumbnail {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px;
            pointer-events: none;
          }

          @media (min-width: 769px) {
            .video-card-1 {
              left: 3%;
              transform: translateY(-50%) rotate(2deg);
            }
            .video-card-2 {
              left: 15%;
              transform: translateY(-50%) rotate(-4deg);
            }
            .video-card-3 {
              left: 30%;
              transform: translateY(-50%) rotate(4deg);
            }
            .video-card-4 {
              left: 45%;
              transform: translateY(-50%) rotate(-4deg);
            }
            .video-card-5 {
              left: 60%;
              transform: translateY(-50%) rotate(6deg);
            }
            .video-card-6 {
              left: 75%;
              transform: translateY(-50%) rotate(-8deg);
            }
          }

          @media (max-width: 768px) {
            .bg-content h2 {
              font-size: 18vw;
            } /* mobile scale */
            .ugc-item {
              left: 50%;
              transform: translate(-50%, -50%);
              height: min(450px, 60vh);
              width: 70%;
              border-width: 3px;
            }
            .video-card-1 {
              transform: translate(-50%, -50%) rotate(2deg);
            }
            .video-card-2 {
              transform: translate(-50%, -50%) rotate(-4deg);
            }
            .video-card-3 {
              transform: translate(-50%, -50%) rotate(4deg);
            }
            .video-card-4 {
              transform: translate(-50%, -50%) rotate(-4deg);
            }
            .video-card-5 {
              transform: translate(-50%, -50%) rotate(6deg);
            }
            .video-card-6 {
              transform: translate(-50%, -50%) rotate(-8deg);
            }
          }

          .view-ugc-btn {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
            display: inline-block;
            padding: 10px 30px;
            background: #fff;
            border-radius: 9px;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 14px;
            font-weight: 900;
            color: #004cac;
            border: 1px solid;
          }

          /* Local font reset: only inside this scroller */
          .ugc-scope h1,
          .ugc-scope h2,
          .ugc-scope h3,
          .ugc-scope .view-ugc-btn,
          .ugc-scope .bg-content h2 {
            font-family:
              Arial,
              "Helvetica Neue",
              Helvetica,
              system-ui,
              -apple-system,
              "Segoe UI",
              Roboto,
              "Noto Sans",
              "Liberation Sans",
              sans-serif !important;
            font-feature-settings: normal;
            font-variation-settings: normal;
            font-synthesis-weight: none;
          }
        `}</style>
      </section>

      {mounted &&
        popupOpen &&
        createPortal(
          <div
            className="popup"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) closePlayer();
            }}
          >
            <button
              className="popup-close"
              aria-label="Close video"
              onClick={closePlayer}
            >
              ×
            </button>
            <video
              ref={popupVideoRef}
              className="popup-video"
              controls
              autoFocus
              playsInline
            />
            <style jsx>{`
              .popup {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
              }
              .popup-video {
                max-width: 90vw;
                max-height: 90vh;
                border-radius: 14px;
                background: #000;
                outline: none;
              }
              .popup-close {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 44px;
                height: 44px;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.9);
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                font-size: 28px;
                line-height: 1;
                cursor: pointer;
                z-index: 10000;
              }
              @media (min-width: 769px) {
                .popup-video {
                  max-width: 70vw;
                  max-height: 80vh;
                }
              }
            `}</style>
          </div>,
          document.body
        )}
    </>
  );
}
