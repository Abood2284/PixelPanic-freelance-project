"use client";
import React, { useEffect, useRef, useMemo, ReactNode, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationStart?: string;
  rotationEnd?: string;
  wordAnimationStart?: string;
  wordAnimationEnd?: string;
  enableColor?: boolean;
  colorStart?: string;
  colorEnd?: string;
  stagger?: number;
  staggerDesktop?: number;
  wordAnimationEndDesktop?: string;
}

export default function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationStart = "top 85%",
  rotationEnd = "bottom bottom",
  wordAnimationStart = "top 75%",
  wordAnimationEnd = "bottom bottom",
  enableColor = true,
  colorStart = "#b8b6b0",
  colorEnd = "#0f0f0f",
  stagger = 0.12,
  staggerDesktop,
  wordAnimationEndDesktop,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    gsap.fromTo(
      el,
      { transformOrigin: "0% 50%", rotate: baseRotation },
      {
        ease: "none",
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: rotationStart,
          end: rotationEnd,
          scrub: true,
        },
      }
    );

    const wordElements = el.querySelectorAll<HTMLElement>(".word");
    const isDesktop =
      typeof window !== "undefined" ? window.innerWidth >= 1024 : false;
    const effectiveStagger =
      isDesktop && typeof staggerDesktop === "number"
        ? staggerDesktop
        : stagger;
    const effectiveWordEnd =
      isDesktop && wordAnimationEndDesktop
        ? wordAnimationEndDesktop
        : wordAnimationEnd;

    gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, willChange: "opacity,color,filter" },
      {
        ease: "none",
        opacity: 1,
        stagger: effectiveStagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: wordAnimationStart,
          end: effectiveWordEnd,
          scrub: true,
        },
      }
    );

    if (enableColor) {
      gsap.fromTo(
        wordElements,
        { color: colorStart },
        {
          ease: "none",
          color: colorEnd,
          stagger: effectiveStagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: wordAnimationStart,
            end: effectiveWordEnd,
            scrub: true,
          },
        }
      );
    }

    if (enableBlur) {
      gsap.fromTo(
        wordElements,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: "none",
          filter: "blur(0px)",
          stagger: effectiveStagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: wordAnimationStart,
            end: effectiveWordEnd,
            scrub: true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationStart,
    rotationEnd,
    wordAnimationStart,
    wordAnimationEnd,
    blurStrength,
    enableColor,
    colorStart,
    colorEnd,
  ]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p className={`${textClassName}`}>{splitText}</p>
    </h2>
  );
}
