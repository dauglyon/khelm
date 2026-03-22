import { forwardRef, type ReactNode } from 'react';
import { m, type HTMLMotionProps } from 'motion/react';
import type { InputType } from '@/theme';
import { cardEnterExit } from '@/common/animations';
import {
  cardBase,
  withAccentBar,
  selectedStyle,
  accentBar,
  accentColorVariants,
} from './Card.css';

export interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'children' | 'ref'> {
  /** Input type determines accent bar color. When omitted, no accent bar is rendered. */
  inputType?: InputType;
  /** Selected state: elevated shadow + border highlight. Default: false */
  selected?: boolean;
  /** Card content */
  children: ReactNode;
  /** Optional layout ID for shared layout transitions */
  layoutId?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      inputType,
      selected = false,
      children,
      className,
      layoutId,
      ...rest
    },
    ref
  ) {
    const classes = [
      cardBase,
      inputType ? withAccentBar : undefined,
      selected ? selectedStyle : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const accentClasses = inputType
      ? [accentBar, accentColorVariants[inputType]].filter(Boolean).join(' ')
      : undefined;

    return (
      <m.div
        ref={ref}
        className={classes}
        variants={cardEnterExit.variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={cardEnterExit.transition}
        layoutId={layoutId}
        {...rest}
      >
        {accentClasses && <div className={accentClasses} />}
        {children}
      </m.div>
    );
  }
);
