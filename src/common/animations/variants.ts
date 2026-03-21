import { easingMotion } from './easing';

export const cardEnterExit = {
  variants: {
    initial: { opacity: 0, y: 16, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.97 },
  },
  transition: {
    duration: 0.3,
    ease: easingMotion.outQuart,
  },
} as const;

export const panelSlide = {
  variants: {
    initial: { x: -24, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -24, opacity: 0 },
  },
  transition: {
    duration: 0.25,
    ease: easingMotion.out,
  },
} as const;

export const fadeIn = {
  variants: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  transition: {
    duration: 0.2,
    ease: easingMotion.inOut,
  },
} as const;

export const staggerContainer = {
  variants: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  transition: {
    duration: 0,
  },
} as const;

export const staggerChild = {
  variants: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  },
  transition: {
    duration: 0.25,
    ease: easingMotion.outQuart,
  },
} as const;

export const cardStatus = {
  variants: {
    idle: { scale: 1 },
    thinking: { scale: [1, 1.005, 1] },
    running: { scale: [1, 1.005, 1] },
    complete: { scale: 1 },
    error: { scale: 1 },
  },
  transition: {
    duration: 0.3,
    ease: easingMotion.inOut,
  },
} as const;

export const dropzone = {
  variants: {
    idle: { scale: 1 },
    active: { scale: 1.02 },
  },
  transition: {
    duration: 0.2,
    ease: easingMotion.out,
  },
} as const;
