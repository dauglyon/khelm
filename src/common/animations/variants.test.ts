import { describe, it, expect } from 'vitest';
import {
  cardEnterExit,
  panelSlide,
  fadeIn,
  staggerContainer,
  staggerChild,
  cardStatus,
  dropzone,
} from './variants';
import { easingMotion } from './easing';

describe('cardEnterExit', () => {
  it('has exactly variants and transition properties', () => {
    expect(Object.keys(cardEnterExit)).toEqual(['variants', 'transition']);
  });

  it('variants include initial, animate, and exit', () => {
    expect(Object.keys(cardEnterExit.variants).sort()).toEqual(['animate', 'exit', 'initial']);
  });

  it('initial has opacity 0 and y 12 (no scale)', () => {
    expect(cardEnterExit.variants.initial).toEqual({ opacity: 0, y: 12 });
  });

  it('animate has opacity 1 and y 0', () => {
    expect(cardEnterExit.variants.animate).toEqual({ opacity: 1, y: 0 });
  });

  it('exit has opacity 0 and scale 0.96 (no y)', () => {
    expect(cardEnterExit.variants.exit).toEqual({ opacity: 0, scale: 0.96 });
  });

  it('transition uses easingMotion.out with duration 0.25', () => {
    expect(cardEnterExit.transition).toEqual({ duration: 0.25, ease: easingMotion.out });
  });
});

describe('panelSlide', () => {
  it('has exactly variants and transition properties', () => {
    expect(Object.keys(panelSlide)).toEqual(['variants', 'transition']);
  });

  it('variants include hidden and visible only (no initial/animate/exit)', () => {
    expect(Object.keys(panelSlide.variants).sort()).toEqual(['hidden', 'visible']);
    expect(panelSlide.variants).not.toHaveProperty('initial');
    expect(panelSlide.variants).not.toHaveProperty('animate');
    expect(panelSlide.variants).not.toHaveProperty('exit');
  });

  it('hidden has x "100%" and opacity 0', () => {
    expect(panelSlide.variants.hidden).toEqual({ x: '100%', opacity: 0 });
  });

  it('visible has x 0 and opacity 1', () => {
    expect(panelSlide.variants.visible).toEqual({ x: 0, opacity: 1 });
  });

  it('transition uses easingMotion.out with duration 0.3', () => {
    expect(panelSlide.transition).toEqual({ duration: 0.3, ease: easingMotion.out });
  });
});

describe('fadeIn', () => {
  it('has exactly variants and transition properties', () => {
    expect(Object.keys(fadeIn)).toEqual(['variants', 'transition']);
  });

  it('variants include initial and animate', () => {
    expect(Object.keys(fadeIn.variants).sort()).toEqual(['animate', 'initial']);
  });

  it('animates opacity only', () => {
    expect(fadeIn.variants.initial).toEqual({ opacity: 0 });
    expect(fadeIn.variants.animate).toEqual({ opacity: 1 });
  });

  it('transition uses easingMotion.inOut with duration 0.2', () => {
    expect(fadeIn.transition).toEqual({ duration: 0.2, ease: easingMotion.inOut });
  });
});

describe('staggerContainer', () => {
  it('has exactly variants and transition properties', () => {
    expect(Object.keys(staggerContainer)).toEqual(['variants', 'transition']);
  });

  it('initial variant is empty', () => {
    expect(staggerContainer.variants.initial).toEqual({});
  });

  it('animate variant has staggerChildren 0.05', () => {
    expect(staggerContainer.variants.animate).toEqual({
      transition: { staggerChildren: 0.05 },
    });
  });

  it('transition duration is 0', () => {
    expect(staggerContainer.transition).toEqual({ duration: 0 });
  });
});

describe('staggerChild', () => {
  it('has exactly variants and transition properties', () => {
    expect(Object.keys(staggerChild)).toEqual(['variants', 'transition']);
  });

  it('initial has opacity 0 and y 8', () => {
    expect(staggerChild.variants.initial).toEqual({ opacity: 0, y: 8 });
  });

  it('animate has opacity 1 and y 0', () => {
    expect(staggerChild.variants.animate).toEqual({ opacity: 1, y: 0 });
  });

  it('transition uses easingMotion.out with duration 0.2', () => {
    expect(staggerChild.transition).toEqual({ duration: 0.2, ease: easingMotion.out });
  });
});

describe('cardStatus', () => {
  it('has exactly variants and transition properties', () => {
    expect(Object.keys(cardStatus)).toEqual(['variants', 'transition']);
  });

  it('has thinking, queued, running, complete, and error variants (no idle)', () => {
    expect(Object.keys(cardStatus.variants).sort()).toEqual(['complete', 'error', 'queued', 'running', 'thinking']);
    expect(cardStatus.variants).not.toHaveProperty('idle');
  });

  it('thinking, queued, and running have scale pulse [1, 1.005, 1]', () => {
    expect(cardStatus.variants.thinking).toEqual({ scale: [1, 1.005, 1] });
    expect(cardStatus.variants.queued).toEqual({ scale: [1, 1.005, 1] });
    expect(cardStatus.variants.running).toEqual({ scale: [1, 1.005, 1] });
  });

  it('only animates scale (no borderColor)', () => {
    const thinking = cardStatus.variants.thinking as Record<string, unknown>;
    expect(thinking).not.toHaveProperty('borderColor');

    const running = cardStatus.variants.running as Record<string, unknown>;
    expect(running).not.toHaveProperty('borderColor');

    const queued = cardStatus.variants.queued as Record<string, unknown>;
    expect(queued).not.toHaveProperty('borderColor');

    const complete = cardStatus.variants.complete as Record<string, unknown>;
    expect(complete).not.toHaveProperty('borderColor');

    const error = cardStatus.variants.error as Record<string, unknown>;
    expect(error).not.toHaveProperty('borderColor');
  });

  it('complete and error have scale 1', () => {
    expect(cardStatus.variants.complete).toEqual({ scale: 1 });
    expect(cardStatus.variants.error).toEqual({ scale: 1 });
  });

  it('transition uses easingMotion.inOut with duration 0.3', () => {
    expect(cardStatus.transition).toEqual({ duration: 0.3, ease: easingMotion.inOut });
  });
});

describe('dropzone', () => {
  it('has exactly variants and transition properties', () => {
    expect(Object.keys(dropzone)).toEqual(['variants', 'transition']);
  });

  it('has idle, active, accept, and reject variants', () => {
    expect(Object.keys(dropzone.variants).sort()).toEqual(['accept', 'active', 'idle', 'reject']);
  });

  it('idle has scale 1', () => {
    expect(dropzone.variants.idle).toEqual({ scale: 1 });
  });

  it('active has scale 1.01', () => {
    expect(dropzone.variants.active).toEqual({ scale: 1.01 });
  });

  it('accept has scale 1.01', () => {
    expect(dropzone.variants.accept).toEqual({ scale: 1.01 });
  });

  it('reject has scale 1 and x oscillation [0, -4, 4, -2, 2, 0]', () => {
    expect(dropzone.variants.reject).toEqual({ scale: 1, x: [0, -4, 4, -2, 2, 0] });
  });

  it('only animates scale/x (no borderColor)', () => {
    const active = dropzone.variants.active as Record<string, unknown>;
    expect(active).not.toHaveProperty('borderColor');

    const idle = dropzone.variants.idle as Record<string, unknown>;
    expect(idle).not.toHaveProperty('borderColor');

    const accept = dropzone.variants.accept as Record<string, unknown>;
    expect(accept).not.toHaveProperty('borderColor');

    const reject = dropzone.variants.reject as Record<string, unknown>;
    expect(reject).not.toHaveProperty('borderColor');
  });

  it('transition uses easingMotion.out with duration 0.15', () => {
    expect(dropzone.transition).toEqual({ duration: 0.15, ease: easingMotion.out });
  });
});
