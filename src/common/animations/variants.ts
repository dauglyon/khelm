import { easingMotion } from './easing';

export const cardStatus = {
  variants: {
    thinking: { scale: [1, 1.005, 1] },
    queued: { scale: [1, 1.005, 1] },
    running: { scale: [1, 1.005, 1] },
    complete: { scale: 1 },
    error: { scale: 1 },
  },
  transition: {
    duration: 0.3,
    ease: easingMotion.inOut,
  },
} as const;

export const cardEnterExit = {
  variants: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96 },
  },
  transition: {
    duration: 0.25,
    ease: easingMotion.out,
  },
} as const;

export const panelSlide = {
  variants: {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  transition: {
    duration: 0.3,
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
    duration: 0.2,
    ease: easingMotion.out,
  },
} as const;

export const dropzone = {
  variants: {
    idle: { scale: 1 },
    active: { scale: 1.01 },
    accept: { scale: 1.01 },
    reject: { scale: 1, x: [0, -4, 4, -2, 2, 0] },
  },
  transition: {
    duration: 0.15,
    ease: easingMotion.out,
  },
} as const;
