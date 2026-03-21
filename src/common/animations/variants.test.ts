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

describe('cardEnterExit', () => {
  it('has variants and transition properties', () => {
    expect(cardEnterExit).toHaveProperty('variants');
    expect(cardEnterExit).toHaveProperty('transition');
  });

  it('variants include initial, animate, and exit', () => {
    expect(cardEnterExit.variants).toHaveProperty('initial');
    expect(cardEnterExit.variants).toHaveProperty('animate');
    expect(cardEnterExit.variants).toHaveProperty('exit');
  });

  it('initial has opacity, y, and scale', () => {
    const initial = cardEnterExit.variants.initial;
    expect(initial).toHaveProperty('opacity');
    expect(initial).toHaveProperty('y');
    expect(initial).toHaveProperty('scale');
  });

  it('animate has opacity 1', () => {
    expect(cardEnterExit.variants.animate).toHaveProperty('opacity', 1);
  });

  it('transition uses easing values', () => {
    expect(cardEnterExit.transition).toHaveProperty('ease');
    expect(cardEnterExit.transition).toHaveProperty('duration');
  });
});

describe('panelSlide', () => {
  it('has variants and transition properties', () => {
    expect(panelSlide).toHaveProperty('variants');
    expect(panelSlide).toHaveProperty('transition');
  });

  it('variants include initial, animate, and exit', () => {
    expect(panelSlide.variants).toHaveProperty('initial');
    expect(panelSlide.variants).toHaveProperty('animate');
    expect(panelSlide.variants).toHaveProperty('exit');
  });

  it('uses x for horizontal sliding', () => {
    expect(panelSlide.variants.initial).toHaveProperty('x');
    expect(panelSlide.variants.initial).toHaveProperty('opacity');
  });
});

describe('fadeIn', () => {
  it('has variants and transition properties', () => {
    expect(fadeIn).toHaveProperty('variants');
    expect(fadeIn).toHaveProperty('transition');
  });

  it('variants include initial and animate', () => {
    expect(fadeIn.variants).toHaveProperty('initial');
    expect(fadeIn.variants).toHaveProperty('animate');
  });

  it('animates opacity only', () => {
    expect(fadeIn.variants.initial).toHaveProperty('opacity', 0);
    expect(fadeIn.variants.animate).toHaveProperty('opacity', 1);
  });
});

describe('staggerContainer', () => {
  it('has variants and transition properties', () => {
    expect(staggerContainer).toHaveProperty('variants');
    expect(staggerContainer).toHaveProperty('transition');
  });

  it('animate variant has staggerChildren', () => {
    const animate = staggerContainer.variants.animate as Record<string, unknown>;
    const transition = animate.transition as Record<string, unknown>;
    expect(transition).toHaveProperty('staggerChildren', 0.05);
  });
});

describe('staggerChild', () => {
  it('has variants and transition properties', () => {
    expect(staggerChild).toHaveProperty('variants');
    expect(staggerChild).toHaveProperty('transition');
  });

  it('initial has opacity and y', () => {
    expect(staggerChild.variants.initial).toHaveProperty('opacity');
    expect(staggerChild.variants.initial).toHaveProperty('y');
  });

  it('animate has opacity 1 and y 0', () => {
    expect(staggerChild.variants.animate).toHaveProperty('opacity', 1);
    expect(staggerChild.variants.animate).toHaveProperty('y', 0);
  });
});

describe('cardStatus', () => {
  it('has variants and transition properties', () => {
    expect(cardStatus).toHaveProperty('variants');
    expect(cardStatus).toHaveProperty('transition');
  });

  it('has idle, thinking, running, complete, and error variants', () => {
    expect(cardStatus.variants).toHaveProperty('idle');
    expect(cardStatus.variants).toHaveProperty('thinking');
    expect(cardStatus.variants).toHaveProperty('running');
    expect(cardStatus.variants).toHaveProperty('complete');
    expect(cardStatus.variants).toHaveProperty('error');
  });

  it('only animates scale (no borderColor)', () => {
    const thinking = cardStatus.variants.thinking as Record<string, unknown>;
    expect(thinking).toHaveProperty('scale');
    expect(thinking).not.toHaveProperty('borderColor');

    const running = cardStatus.variants.running as Record<string, unknown>;
    expect(running).toHaveProperty('scale');
    expect(running).not.toHaveProperty('borderColor');

    const idle = cardStatus.variants.idle as Record<string, unknown>;
    expect(idle).toHaveProperty('scale');
    expect(idle).not.toHaveProperty('borderColor');
  });
});

describe('dropzone', () => {
  it('has variants and transition properties', () => {
    expect(dropzone).toHaveProperty('variants');
    expect(dropzone).toHaveProperty('transition');
  });

  it('has idle and active variants', () => {
    expect(dropzone.variants).toHaveProperty('idle');
    expect(dropzone.variants).toHaveProperty('active');
  });

  it('only animates scale (no borderColor)', () => {
    const active = dropzone.variants.active as Record<string, unknown>;
    expect(active).toHaveProperty('scale');
    expect(active).not.toHaveProperty('borderColor');

    const idle = dropzone.variants.idle as Record<string, unknown>;
    expect(idle).toHaveProperty('scale');
    expect(idle).not.toHaveProperty('borderColor');
  });
});
